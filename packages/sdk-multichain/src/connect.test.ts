/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import type { MultichainOptions, MultichainCore, Scope, SessionData } from './domain';
// Carefull, order of import matters to keep mocks working
import { runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv, runTestsInWebMobileEnv } from '../tests/fixtures.test';
import { Store } from './store';
import { mockSessionData, mockSessionRequestData } from '../tests/data';
import type { TestSuiteOptions, MockedData } from '../tests/types';
import { SessionStore } from '@metamask/mobile-wallet-protocol-core';

async function waitForInstallModal(sdk: MultichainCore) {
	const onShowInstallModal = t.vi.spyOn(sdk as any, 'showInstallModal');

	let attempts = 5;
	while (attempts > 0) {
		try {
			t.expect(onShowInstallModal).toHaveBeenCalled();
			break;
		} catch {
			attempts--;
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}
	t.expect(onShowInstallModal).toHaveBeenCalled();
}

async function expectUIFactoryRenderInstallModal(sdk: MultichainCore) {
	const onRenderInstallModal = t.vi.spyOn((sdk as any).options.ui.factory, 'renderInstallModal');

	let attempts = 5;
	while (attempts > 0) {
		try {
			t.expect(onRenderInstallModal).toHaveBeenCalled();
			break;
		} catch {
			attempts--;
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}
	t.expect(onRenderInstallModal).toHaveBeenCalled();
}

function testSuite<T extends MultichainOptions>({ platform, createSDK, options: sdkOptions, ...options }: TestSuiteOptions<T>) {
	const { beforeEach, afterEach } = options;
	const originalSdkOptions = sdkOptions;
	let sdk: MultichainCore;

	t.describe(`${platform} tests`, () => {
		const isWebEnv = platform === 'web' || platform === 'web-mobile';
		const isMWPPlatform = platform === 'web-mobile' || platform === 'rn' || platform === 'node';

		const transportString = platform === 'web' ? 'browser' : 'mwp';
		let mockedData: MockedData;
		let testOptions: T;

		t.beforeEach(async () => {
			const uiOptions: MultichainOptions['ui'] =
				platform === 'web-mobile'
					? {
							...originalSdkOptions.ui,
							preferDesktop: false,
							preferExtension: false,
						}
					: originalSdkOptions.ui;

			mockedData = await beforeEach();
			// Set the transport type as a string in storage (this is how it's stored)
			testOptions = {
				...originalSdkOptions,
				analytics: {
					...originalSdkOptions.analytics,
					enabled: platform !== 'node',
					integrationType: 'test',
				},
				ui: uiOptions,
				storage: new Store({
					platform: platform as 'web' | 'rn' | 'node',
					get(key) {
						return Promise.resolve(mockedData.nativeStorageStub.getItem(key));
					},
					set(key, value) {
						return Promise.resolve(mockedData.nativeStorageStub.setItem(key, value));
					},
					delete(key) {
						return Promise.resolve(mockedData.nativeStorageStub.removeItem(key));
					},
				}),
			};
		});

		t.afterEach(async () => {
			await afterEach(mockedData);
		});

		t.it(`${platform} should handle transport connection errors`, async () => {
			const connectionError = new Error('Failed to connect transport');

			//Mock defaultTransport for Extension + Browser
			mockedData.mockDefaultTransport.connect.mockRejectedValue(connectionError);
			//Mock dappClient for MWP
			mockedData.mockDappClient.connect.mockRejectedValue(connectionError);

			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;
			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('loaded');
			t.expect(() => sdk.provider).toThrow();
			t.expect(() => sdk.transport).toThrow();

			// Expect sdk.connect to reject if transport cannot connect
			await t.expect(() => sdk.connect(scopes, caipAccountIds)).rejects.toThrow(connectionError);

			//Expect to find all the transport mocks DISCONNECTED
			t.expect(mockedData.mockDefaultTransport.__isConnected).toBe(false);
			t.expect(mockedData.mockDappClient.state).toBe('DISCONNECTED');

			mockedData.mockDefaultTransport.connect.mockClear();
			(mockedData.mockDappClient as any).connect.mockClear();
		});

		t.it(`${platform} should connect transport and create session when not connected`, async () => {
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			//Empty initial session
			mockedData.mockWalletGetSession.mockImplementation(async () => undefined as any);
			mockedData.mockWalletCreateSession.mockImplementation(async () => mockSessionData);
			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);

			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('loaded');
			t.expect(() => sdk.provider).toThrow();
			t.expect(() => sdk.transport).toThrow();

			await sdk.connect(scopes, caipAccountIds);

			t.expect(sdk.state).toBe('connected');
			t.expect(sdk.storage).toBeDefined();
			t.expect(sdk.transport).toBeDefined();
			t.expect(() => sdk.provider).toThrow();

			if (isMWPPlatform) {
				t.expect(mockedData.mockDappClient.state).toBe('CONNECTED');
				t.expect(mockedData.mockDappClient.sendRequest).toHaveBeenCalled();
			} else {
				t.expect(mockedData.mockDefaultTransport.__isConnected).toBe(true);
				t.expect(mockedData.mockDefaultTransport.request).toHaveBeenCalled();
			}
		});

		t.it(`${platform} should reconnect to the same transport when already connected in the past`, async () => {
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
			mockedData.mockWalletGetSession.mockImplementation(async () => undefined as any);
			mockedData.mockWalletCreateSession.mockImplementation(async () => mockSessionData);

			sdk = await createSDK(testOptions);
			t.expect(sdk.state).toBe('connected');
			t.expect(sdk.transport).toBeDefined();
			t.expect(() => sdk.provider).toThrow();
			t.expect(sdk.storage).toBeDefined();

			await t.expect(sdk.storage.getTransport()).resolves.toBe(transportString);
		});

		t.it(`${platform} should skip transport connection when already connected`, async () => {
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockWalletGetSession.mockImplementation(async () => mockSessionData);
			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
			mockedData.mockWalletCreateSession.mockImplementation(async () => mockSessionData);
			if (isWebEnv) {
				await mockedData.mockDefaultTransport.connect();
			} else {
				await mockedData.mockDappClient.connect();
			}

			sdk = await createSDK(testOptions);
			t.expect(sdk.transport).toBeDefined();
			t.expect(() => sdk.provider).toThrow();
			t.expect(sdk.storage).toBeDefined();
			t.expect(sdk.state).toBe('connected');

			if (isWebEnv) {
				t.expect(mockedData.mockDefaultTransport.__isConnected).toBe(true);
				t.expect(mockedData.mockDefaultTransport.connect).toHaveBeenCalled();
				mockedData.mockDefaultTransport.connect.mockClear();
			} else {
				t.expect(mockedData.mockDappClient.state).toBe('CONNECTED');
				t.expect(mockedData.mockDappClient.connect).toHaveBeenCalled();
				mockedData.mockDappClient.connect.mockClear();
			}

			await t.expect(sdk.storage.getTransport()).resolves.toBe(transportString);
		});

		t.it(`${platform} should handle invalid CAIP account IDs gracefully`, async () => {
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['invalid-account-id', 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;
			let unloadSpy!: t.MockInstance<() => void>;
			let showModalPromise!: Promise<void>;

			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
			mockedData.mockWalletGetSession.mockImplementation(async () => undefined as any);
			mockedData.mockWalletCreateSession.mockImplementation(async () => mockSessionData);
			sdk = await createSDK(testOptions);

			unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');

			t.expect(sdk.state).toBe('loaded');
			t.expect(() => sdk.transport).toThrow();

			if (platform !== 'web' && platform !== 'web-mobile') {
				showModalPromise = waitForInstallModal(sdk);
			}

			const connectPromise = sdk.connect(scopes, caipAccountIds);

			if (isMWPPlatform) {
				if (platform !== 'web-mobile') {
					(mockedData.mockDappClient as any).__state = 'CONNECTED';
					//For MWP we simulate a connection with DappClient after showing the QRCode
					await expectUIFactoryRenderInstallModal(sdk);
				}

				if (platform !== 'web-mobile') {
					// Connect to MWP using dappClient mock
					mockedData.mockDappClient.connect();
					await showModalPromise;
					// Should have unloaded the modal and calling successCallback
					t.expect(unloadSpy).toHaveBeenCalledWith();
				}
			}

			await connectPromise;

			t.expect(sdk.state).toBe('connected');
			t.expect(sdk.storage).toBeDefined();
			t.expect(() => sdk.provider).toThrow();
			t.expect(sdk.transport).toBeDefined();

			if (isMWPPlatform) {
				t.expect(mockedData.mockDappClient.state).toBe('CONNECTED');
			} else {
				t.expect(mockedData.mockDefaultTransport.__isConnected).toBe(true);
			}

			await t.expect(sdk.storage.getTransport()).resolves.toBe(transportString);
		});

		t.it(`${platform} should handle session creation errors`, async () => {
			const sessionError = new Error('Failed to create session');
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			mockedData.mockWalletGetSession.mockImplementation(async () => undefined as any);
			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
			mockedData.mockWalletCreateSession.mockRejectedValue(sessionError);

			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('loaded');
			t.expect(() => sdk.transport).toThrow();

			await t.expect(() => sdk.connect(scopes, caipAccountIds)).rejects.toThrow(sessionError);
		});

		t.it(`${platform} should handle session revocation errors on session upgrade`, async () => {
			const existingSessionData: SessionData = {
				...mockSessionData,
				sessionScopes: {
					'eip155:1': {
						methods: ['eth_sendTransaction'],
						notifications: ['accountsChanged'],
						accounts: ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'],
					},
				},
			};

			const revocationError = new Error('Failed to revoke session');

			mockedData.mockWalletCreateSession.mockResolvedValue(existingSessionData);
			mockedData.mockWalletGetSession.mockResolvedValue(existingSessionData);
			mockedData.mockWalletRevokeSession.mockImplementation(async () => {
				throw revocationError;
			});
			t.vi.spyOn(SessionStore.prototype, 'list').mockImplementation(async () => Promise.resolve([await (mockedData as any).mockWalletGetSession()]));

			const scopes = ['eip155:137'] as Scope[]; // Different scope to trigger upgrade
			const caipAccountIds = ['eip155:137:0x1234567890abcdef1234567890abcdef12345678'] as any;

			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('connected');
			t.expect(sdk.storage).toBeDefined();
			t.expect(() => sdk.provider).toThrow();
			t.expect(sdk.transport).toBeDefined();

			await t.expect(sdk.connect(scopes, caipAccountIds)).rejects.toThrow(revocationError);
		});

		t.it(`${platform} should disconnect transport successfully`, async () => {
			mockedData.mockWalletGetSession.mockResolvedValue(mockSessionData);
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);

			sdk = await createSDK(testOptions);
			await sdk.disconnect();

			if (platform === 'web') {
				t.expect(mockedData.mockDefaultTransport.disconnect).toHaveBeenCalled();
			} else {
				t.expect(mockedData.mockDappClient.disconnect).toHaveBeenCalled();
			}
		});

		t.it(`${platform} should handle disconnect errors`, async () => {
			const scopes = ['eip155:137'] as Scope[]; // Same scope as existing session to trigger revocation
			const caipAccountIds = ['eip155:137:0x1234567890abcdef1234567890abcdef12345678'] as any;

			const disconnectError = new Error('Failed to disconnect transport');

			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockWalletGetSession.mockResolvedValue(mockSessionData);
			mockedData.mockWalletCreateSession.mockResolvedValue(mockSessionData);
			mockedData.mockWalletRevokeSession.mockResolvedValue(undefined);

			if (platform === 'web') {
				mockedData.mockDefaultTransport.disconnect.mockRejectedValue(disconnectError);
			} else {
				mockedData.mockDappClient.disconnect.mockRejectedValue(disconnectError);
			}

			sdk = await createSDK(testOptions);
			await sdk.connect(scopes, caipAccountIds);
			t.expect(sdk.state).toBe('connected');
			t.expect(() => sdk.provider).toThrow();
			t.expect(sdk.transport).toBeDefined();

			await t.expect(sdk.disconnect()).rejects.toThrow('Failed to disconnect transport');
		});

		if (platform === 'web-mobile') {
			t.it(`${platform} should reconnect to mwp when comming back from Mobile app`, async () => {
				mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
				mockedData.mockWalletGetSession.mockResolvedValue(mockSessionData);
				mockedData.mockWalletCreateSession.mockResolvedValue(mockSessionData);
				mockedData.mockWalletRevokeSession.mockResolvedValue(undefined);

				sdk = await createSDK(testOptions);

				t.expect(sdk.state).toBe('connected');
				t.expect(() => sdk.provider).toThrow();
				t.expect(sdk.transport).toBeDefined();

				t.expect(mockedData.mockDappClient.state).toBe('CONNECTED');
				await mockedData.mockDappClient.disconnect();
				t.expect(mockedData.mockDappClient.state).toBe('DISCONNECTED');

				window.dispatchEvent(new Event('focus'));
				t.expect(mockedData.mockDappClient.reconnect).toHaveBeenCalled();
			});
		}
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = {
	dapp: exampleDapp,
} as any;

runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
runTestsInWebMobileEnv(baseTestOptions, testSuite, exampleDapp.url);
