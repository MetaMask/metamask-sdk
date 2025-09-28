/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import type { MultichainOptions, MultichainCore, Scope } from './domain';
// Carefull, order of import matters to keep mocks working
import { runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv } from '../tests/fixtures.test';
import { Store } from './store';
import { mockSessionData, mockSessionRequestData } from '../tests/data';
import type { TestSuiteOptions, MockedData } from '../tests/types';

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
		const transportString = platform === 'web' ? 'browser' : 'mwp';
		let mockedData: MockedData;
		let testOptions: T;

		t.beforeEach(async () => {
			mockedData = await beforeEach();
			// Set the transport type as a string in storage (this is how it's stored)
			testOptions = {
				...originalSdkOptions,
				analytics: {
					...originalSdkOptions.analytics,
					enabled: platform !== 'node',
					integrationType: 'test',
				},
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
			mockedData.mockWalletGetSession.mockImplementation(() => undefined as any);
			mockedData.mockWalletCreateSession.mockImplementation(() => mockSessionData);
			mockedData.mockSessionRequest.mockImplementation(() => mockSessionRequestData);

			let showModalPromise!: Promise<void>;
			let unloadSpy!: t.MockInstance<() => void>;
			let onConnectionSuccessSpy!: t.MockInstance<any>;

			sdk = await createSDK(testOptions);

			onConnectionSuccessSpy = t.vi.spyOn(sdk as any, 'onConnectionSuccess');
			unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');

			t.expect(sdk.state).toBe('loaded');
			t.expect(() => sdk.provider).toThrow();
			t.expect(() => sdk.transport).toThrow();

			if (platform !== 'web') {
				// Platform web is browser with metamask extension, won't have install modal
				showModalPromise = waitForInstallModal(sdk);
			}

			const connectPromise = sdk.connect(scopes, caipAccountIds);

			if (platform !== 'web') {
				(mockedData.mockDappClient as any).__state = 'CONNECTED';
				//For MWP we simulate a connection with DappClient after showing the QRCode
				await expectUIFactoryRenderInstallModal(sdk);
				// Connect to MWP using dappClient mock
				await mockedData.mockDappClient.connect();
				await showModalPromise;
				// Should have unloaded the modal and calling successCallback
				t.expect(unloadSpy).toHaveBeenCalledWith();
				t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
			} else {
			}

			await connectPromise;

			t.expect(sdk.state).toBe('connected');
			t.expect(sdk.storage).toBeDefined();
			t.expect(sdk.transport).toBeDefined();

			const { sessionScopes, expiry: _, ...rest } = mockSessionData;
			const expectedSessionResponse = {
				method: 'wallet_createSession',
				params: {
					...rest,
					optionalScopes: sessionScopes,
				},
			};

			if (platform !== 'web') {
				t.expect(mockedData.mockDappClient.state).toBe('CONNECTED');
				t.expect(mockedData.mockDappClient.sendRequest).toHaveBeenCalledWith(t.expect.objectContaining(expectedSessionResponse));
			} else {
				t.expect(mockedData.mockDefaultTransport.__isConnected).toBe(true);
				t.expect(mockedData.mockDefaultTransport.request).toHaveBeenCalledWith(expectedSessionResponse);
			}
		});

		t.it(`${platform} should skip transport connection when already connected`, async () => {
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockWalletGetSession.mockImplementation(() => mockSessionData);
			mockedData.mockSessionRequest.mockImplementation(() => mockSessionRequestData);

			if (platform === 'web') {
				await mockedData.mockDefaultTransport.connect();
			} else {
				await mockedData.mockDappClient.connect();
			}

			sdk = await createSDK(testOptions);
			t.expect(sdk.transport).toBeDefined();
			t.expect(sdk.storage).toBeDefined();
			t.expect(sdk.state).toBe('connected');

			if (platform === 'web') {
				t.expect(mockedData.mockDefaultTransport.__isConnected).toBe(true);
				t.expect(mockedData.mockDefaultTransport.connect).toHaveBeenCalled();
				mockedData.mockDefaultTransport.connect.mockClear();
			} else {
				t.expect(mockedData.mockDappClient.state).toBe('CONNECTED');
				t.expect(mockedData.mockDappClient.connect).toHaveBeenCalled();
				mockedData.mockDappClient.connect.mockClear();
			}

			await sdk.connect(scopes, caipAccountIds);

			if (platform === 'web') {
				t.expect(mockedData.mockDefaultTransport.__isConnected).toBe(true);
				t.expect(mockedData.mockDefaultTransport.connect).not.toHaveBeenCalled();
			} else {
				t.expect(mockedData.mockDappClient.state).toBe('CONNECTED');
				t.expect(mockedData.mockDappClient.connect).not.toHaveBeenCalled();
			}
		});

		t.it(`${platform} should handle invalid CAIP account IDs gracefully`, async () => {
			const consoleErrorSpy = t.vi.spyOn(console, 'error').mockImplementation(() => {});

			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['invalid-account-id', 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;
			let unloadSpy!: t.MockInstance<() => void>;
			let onConnectionSuccessSpy!: t.MockInstance<any>;
			let showModalPromise!: Promise<void>;

			mockedData.mockSessionRequest.mockImplementation(() => mockSessionRequestData);
			mockedData.mockWalletGetSession.mockImplementation(() => undefined as any);
			mockedData.mockWalletCreateSession.mockImplementation(() => mockSessionData);
			sdk = await createSDK(testOptions);

			onConnectionSuccessSpy = t.vi.spyOn(sdk as any, 'onConnectionSuccess');
			unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');

			t.expect(sdk.state).toBe('loaded');
			t.expect(() => sdk.transport).toThrow();

			if (platform !== 'web') {
				showModalPromise = waitForInstallModal(sdk);
			}

			const connectPromise = sdk.connect(scopes, caipAccountIds);

			if (platform !== 'web') {
				//For MWP we simulate a connection with DappClient after showing the QRCode
				await expectUIFactoryRenderInstallModal(sdk);
				// Connect to MWP using dappClient mock
				await mockedData.mockDappClient.connect();
				await showModalPromise;
				// Should have unloaded the modal and calling successCallback
				t.expect(unloadSpy).toHaveBeenCalledWith();
				t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
			} else {
			}

			await connectPromise;

			t.expect(sdk.state).toBe('connected');
			t.expect(sdk.storage).toBeDefined();
			t.expect(sdk.provider).toBeDefined();
			t.expect(sdk.transport).toBeDefined();

			if (platform !== 'web') {
				t.expect(mockedData.mockDappClient.state).toBe('CONNECTED');
			} else {
				t.expect(mockedData.mockDefaultTransport.__isConnected).toBe(true);
			}

			t.expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid CAIP account ID: "invalid-account-id"', t.expect.any(Error));
		});

		t.it(`${platform} should handle session creation errors`, async () => {
			const sessionError = new Error('Failed to create session');
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			let unloadSpy!: t.MockInstance<() => void>;
			let onConnectionSuccessSpy!: t.MockInstance<any>;
			let showModalPromise!: Promise<void>;

			mockedData.mockWalletGetSession.mockImplementation(() => undefined as any);
			mockedData.mockSessionRequest.mockImplementation(() => mockSessionRequestData);
			mockedData.mockWalletCreateSession.mockRejectedValue(sessionError);

			sdk = await createSDK(testOptions);

			onConnectionSuccessSpy = t.vi.spyOn(sdk as any, 'onConnectionSuccess');
			unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');

			t.expect(sdk.state).toBe('loaded');
			t.expect(() => sdk.transport).toThrow();

			if (platform !== 'web') {
				showModalPromise = waitForInstallModal(sdk);
			}

			const connectPromise = sdk.connect(scopes, caipAccountIds);

			if (platform !== 'web') {
				(mockedData.mockDappClient as any).__state = 'CONNECTED';
				//For MWP we simulate a connection with DappClient after showing the QRCode
				await expectUIFactoryRenderInstallModal(sdk);
				// Connect to MWP using dappClient mock
				await mockedData.mockDappClient.connect();
				await showModalPromise;
				// Should have unloaded the modal and calling successCallback
				t.expect(unloadSpy).toHaveBeenCalledWith();
				t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
			} else {
			}

			await t.expect(() => connectPromise).rejects.toThrow(sessionError);
			// Now test the connect flow with session creation error
			await t.expect(mockedData.mockLogger).toHaveBeenCalledWith('MetaMaskSDK error during onConnectionSuccess', sessionError);
		});

		// t.it(`${platform} should handle session revocation errors on session upgrade`, async () => {
		// 	const existingSessionData = {
		// 		...mockSessionData,
		// 		sessionScopes: {
		// 			'eip155:1': {
		// 				methods: ['eth_sendTransaction'],
		// 				notifications: ['accountsChanged'],
		// 				accounts: ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'],
		// 			},
		// 		},
		// 	};

		// 	const revocationError = new Error('Failed to revoke session');

		// 	mockedData.mockTransport.request.mockImplementation((input: any) => {
		// 		if (input.method === 'wallet_getSession') {
		// 			return Promise.resolve({
		// 				id: 1,
		// 				jsonrpc: '2.0',
		// 				result: existingSessionData,
		// 			});
		// 		}

		// 		if (input.method === 'wallet_revokeSession') {
		// 			return Promise.reject(revocationError);
		// 		}
		// 		return Promise.reject(new Error('Forgot to mock this RPC call?'));
		// 	});

		// 	const scopes = ['eip155:137'] as Scope[]; // Same scope as existing session to trigger revocation
		// 	const caipAccountIds = ['eip155:137:0x1234567890abcdef1234567890abcdef12345678'] as any;
		// 	sdk = await createSDK(testOptions);

		// 	const onConnectionSuccessSpy = t.vi.spyOn(sdk as any, 'onConnectionSuccess');

		// 	let showModalPromise!: Promise<void>;
		// 	let unloadSpy!: t.MockInstance<() => void>;

		// 	if (platform !== 'web') {
		// 		unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');
		// 		showModalPromise = waitForInstallModal(sdk);
		// 	}

		// 	const connectPromise = sdk.connect(scopes, caipAccountIds);

		// 	if (platform !== 'web') {
		// 		//For MWP we simulate a connection with DappClient after showing the QRCode
		// 		await expectUIFactoryRenderInstallModal(sdk);

		// 		//Emit session_request QRCode back to Modal
		// 		await mockedData.mockDappClient.emit('session_request', mockSessionData);
		// 		// Connect to MWP using dappClient mock
		// 		await mockedData.mockDappClient.connect();
		// 		await showModalPromise;

		// 		// Should have unloaded the modal and calling successCallback
		// 		t.expect(unloadSpy).toHaveBeenCalledWith();
		// 		t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
		// 	}
		// 	await connectPromise;

		// 	// Now test the connect flow with session creation error
		// 	await t.expect(mockedData.mockLogger).toHaveBeenCalledWith('MetaMaskSDK error during onConnectionSuccess', revocationError);
		// });

		// t.it(`${platform} should disconnect transport successfully`, async () => {
		// 	const multichainModule = await import('@metamask/multichain-api-client');
		// 	const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

		// 	mockedData.mockTransport.isConnected.mockReturnValue(true);
		// 	mockMultichainClient.getSession.mockResolvedValue(undefined);
		// 	mockMultichainClient.revokeSession.mockReset();

		// 	mockedData.nativeStorageStub.setItem('multichain-transport', transportString);

		// 	sdk = await createSDK(testOptions);
		// 	await sdk.disconnect();
		// 	t.expect(mockedData.mockTransport.disconnect).toHaveBeenCalled();
		// });

		// t.it(`${platform} should handle disconnect errors`, async () => {
		// 	const scopes = ['eip155:137'] as Scope[]; // Same scope as existing session to trigger revocation
		// 	const caipAccountIds = ['eip155:137:0x1234567890abcdef1234567890abcdef12345678'] as any;

		// 	const disconnectError = new Error('Failed to disconnect transport');
		// 	mockedData.mockTransport.disconnect.mockRejectedValue(disconnectError);

		// 	sdk = await createSDK(testOptions);
		// 	const onConnectionSuccessSpy = t.vi.spyOn(sdk as any, 'onConnectionSuccess');

		// 	let showModalPromise!: Promise<void>;
		// 	let unloadSpy!: t.MockInstance<() => void>;

		// 	if (platform !== 'web') {
		// 		unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');
		// 		showModalPromise = waitForInstallModal(sdk);
		// 	}

		// 	const connectPromise = sdk.connect(scopes, caipAccountIds);

		// 	if (platform !== 'web') {
		// 		//For MWP we simulate a connection with DappClient after showing the QRCode
		// 		await expectUIFactoryRenderInstallModal(sdk);

		// 		//Emit session_request QRCode back to Modal
		// 		await mockedData.mockDappClient.emit('session_request', mockSessionData);
		// 		// Connect to MWP using dappClient mock
		// 		await mockedData.mockDappClient.connect();
		// 		await showModalPromise;

		// 		// Should have unloaded the modal and calling successCallback
		// 		t.expect(unloadSpy).toHaveBeenCalledWith();
		// 		t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
		// 	}
		// 	await connectPromise;
		// 	await t.expect(sdk.disconnect()).rejects.toThrow('Failed to disconnect transport');
		// });
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = {
	dapp: exampleDapp,
} as any;

runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
