/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import type { MultiChainFNOptions, MultichainCore, Scope } from './domain';
// Carefull, order of import matters to keep mocks working
import { runTestsInNodeEnv, type MockedData, mockSessionData, type TestSuiteOptions, runTestsInRNEnv, runTestsInWebEnv } from './fixtures.test';
import { Store } from './store';

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

async function waitForUnload(sdk: MultichainCore) {
	const onUnload = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');
	let attempts = 5;
	while (attempts > 0) {
		try {
			t.expect(onUnload).toHaveBeenCalled();
			break;
		} catch {
			attempts--;
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}
	t.expect(onUnload).toHaveBeenCalled();
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

async function waitForMWPSetup(sdk: MultichainCore) {
	const onSetupMWP = t.vi.spyOn(sdk as any, 'setupMWP');
	let attempts = 5;
	while (attempts > 0) {
		try {
			t.expect(onSetupMWP).toHaveBeenCalled();
			t.expect(onSetupMWP).resolves.toBeUndefined();
			break;
		} catch {
			attempts--;
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}
	t.expect(onSetupMWP).toHaveBeenCalled();
	t.expect(onSetupMWP).resolves.toBeUndefined();
}

async function waitForConnectionSuccess(sdk: MultichainCore) {
	const onConnectionSuccess = t.vi.spyOn(sdk as any, 'onConnectionSuccess');
	let attempts = 5;
	while (attempts > 0) {
		try {
			t.expect(onConnectionSuccess).toHaveBeenCalled();
			break;
		} catch {
			attempts--;
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}
	t.expect(onConnectionSuccess).toHaveBeenCalled();
}

function testSuite<T extends MultiChainFNOptions>({ platform, createSDK, options: sdkOptions, ...options }: TestSuiteOptions<T>) {
	const { beforeEach, afterEach } = options;
	const originalSdkOptions = sdkOptions;
	let sdk: MultichainCore;

	t.describe(`${platform} tests`, () => {
		let mockedData: MockedData;
		let testOptions: T;
		const transportString = platform === 'web' ? 'browser' : 'mwp';

		t.beforeEach(async () => {
			mockedData = await beforeEach();
			//mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
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

		t.it(`${platform} should connect transport and create session when not connected`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			mockMultichainClient.getSession.mockResolvedValue(undefined);
			mockMultichainClient.createSession.mockResolvedValue(mockSessionData);

			// Create a new SDK instance with the mock configured correctly
			const sdk = await createSDK(testOptions);
			const onConnectionSuccessSpy = t.vi.spyOn(sdk as any, 'onConnectionSuccess');

			t.expect(sdk.state).toBe('loaded');
			t.expect(sdk.storage).toBeDefined();
			// There's no default stored transport, so should throw
			t.expect(() => sdk.provider).toThrow();
			t.expect(() => sdk.transport).toThrow();

			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			let showModalPromise!: Promise<void>;
			let unloadSpy!: t.MockInstance<() => void>;

			if (platform !== 'web') {
				unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');
				showModalPromise = waitForInstallModal(sdk);
			}

			const connectPromise = sdk.connect(scopes, caipAccountIds);

			if (platform !== 'web') {
				//For MWP we simulate a connection with DappClient after showing the QRCode
				await expectUIFactoryRenderInstallModal(sdk);

				//Emit session_request QRCode back to Modal
				await mockedData.mockDappClient.emit('session_request', mockSessionData);
				// Connect to MWP using dappClient mock
				await mockedData.mockDappClient.connect();
				await showModalPromise;

				// Should have unloaded the modal and calling successCallback
				t.expect(unloadSpy).toHaveBeenCalledWith(true);
				t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
			}
			await connectPromise;

			t.expect(mockedData.mockTransport.connect).toHaveBeenCalled();
			t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
			t.expect(mockedData.mockTransport.isConnected()).toBe(true);

			if (platform === 'web') {
				// Show install modal should not be called if extension is available
				t.expect(mockedData.showInstallModalSpy).not.toHaveBeenCalled();
				t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
			}

			t.expect(mockMultichainClient.createSession).toHaveBeenCalledWith({
				optionalScopes: {
					'eip155:1': {
						methods: [],
						notifications: [],
						accounts: ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'],
					},
				},
			});

			mockedData.mockTransport.__triggerNotification({
				method: 'session_changed',
				params: {
					session: mockSessionData,
				},
			});
			t.expect(mockedData.emitSpy).toHaveBeenCalledWith('session_changed', mockSessionData);
		});

		t.it(`${platform} should skip transport connection when already connected`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);

			mockMultichainClient.getSession.mockResolvedValue(mockSessionData);

			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			sdk = await createSDK(testOptions);
			t.expect(sdk.provider).toBeDefined();
			t.expect(sdk.transport).toBeDefined();
			t.expect(sdk.storage).toBeDefined();
			t.expect(mockedData.mockTransport.connect).toHaveBeenCalled();
			mockedData.mockTransport.connect.mockReset();

			await sdk.connect(scopes, caipAccountIds);
			t.expect(mockedData.mockTransport.connect).not.toHaveBeenCalled();
		});

		t.it(`${platform} should handle invalid CAIP account IDs gracefully`, async () => {
			const consoleErrorSpy = t.vi.spyOn(console, 'error').mockImplementation(() => {});

			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			mockMultichainClient.getSession.mockResolvedValue(undefined);

			// Mock console.error to capture invalid account ID errors

			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['invalid-account-id', 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;
			sdk = await createSDK(testOptions);

			const onConnectionSuccessSpy = t.vi.spyOn(sdk as any, 'onConnectionSuccess');

			let showModalPromise!: Promise<void>;
			let unloadSpy!: t.MockInstance<() => void>;

			if (platform !== 'web') {
				unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');
				showModalPromise = waitForInstallModal(sdk);
			}

			const connectPromise = sdk.connect(scopes, caipAccountIds);

			if (platform !== 'web') {
				//For MWP we simulate a connection with DappClient after showing the QRCode
				await expectUIFactoryRenderInstallModal(sdk);

				//Emit session_request QRCode back to Modal
				await mockedData.mockDappClient.emit('session_request', mockSessionData);
				// Connect to MWP using dappClient mock
				await mockedData.mockDappClient.connect();
				await showModalPromise;

				// Should have unloaded the modal and calling successCallback
				t.expect(unloadSpy).toHaveBeenCalledWith(true);
				t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
			}
			await connectPromise;

			if (platform === 'web') {
				// Show install modal should not be called if extension is available
				t.expect(mockedData.showInstallModalSpy).not.toHaveBeenCalled();
				t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
			}

			t.expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid CAIP account ID: "invalid-account-id"', t.expect.any(Error));
			t.expect(mockMultichainClient.createSession).toHaveBeenCalledWith({
				optionalScopes: {
					'eip155:1': {
						methods: [],
						notifications: [],
						accounts: ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'],
					},
				},
			});
			consoleErrorSpy.mockRestore();
		});

		t.it(`${platform} should handle transport connection errors`, async () => {
			const connectionError = new Error('Failed to connect transport');
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;
			mockMultichainClient.getSession.mockResolvedValue(mockSessionData);
			mockedData.mockTransport.connect.mockRejectedValue(connectionError);
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;
			sdk = await createSDK(testOptions);
			await t.expect(sdk.connect(scopes, caipAccountIds)).rejects.toThrow(connectionError);
		});

		t.it(`${platform} should gracefully handle session creation errors`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			mockMultichainClient.getSession.mockResolvedValue(undefined);
			const sessionError = new Error('Failed to create session');
			mockMultichainClient.createSession.mockRejectedValue(sessionError);

			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;
			sdk = await createSDK(testOptions);

			const onConnectionSuccessSpy = t.vi.spyOn(sdk as any, 'onConnectionSuccess');

			let showModalPromise!: Promise<void>;
			let unloadSpy!: t.MockInstance<() => void>;

			if (platform !== 'web') {
				unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');
				showModalPromise = waitForInstallModal(sdk);
			}

			const connectPromise = sdk.connect(scopes, caipAccountIds);

			if (platform !== 'web') {
				//For MWP we simulate a connection with DappClient after showing the QRCode
				await expectUIFactoryRenderInstallModal(sdk);

				//Emit session_request QRCode back to Modal
				await mockedData.mockDappClient.emit('session_request', mockSessionData);
				// Connect to MWP using dappClient mock
				await mockedData.mockDappClient.connect();
				await showModalPromise;

				// Should have unloaded the modal and calling successCallback
				t.expect(unloadSpy).toHaveBeenCalledWith(true);
				t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
			}
			await connectPromise;

			// Now test the connect flow with session creation error
			await t.expect(mockedData.mockLogger).toHaveBeenCalledWith('MetaMaskSDK error during onConnectionSuccess', sessionError);
		});

		t.it(`${platform} should handle session revocation errors on session upgrade`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			const existingSessionData = {
				...mockSessionData,
				sessionScopes: {
					'eip155:1': {
						methods: ['eth_sendTransaction'],
						notifications: ['accountsChanged'],
						accounts: ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'],
					},
				},
			};

			mockMultichainClient.getSession.mockResolvedValue(existingSessionData);

			const revocationError = new Error('Failed to revoke session');
			mockMultichainClient.revokeSession.mockRejectedValue(revocationError);

			const scopes = ['eip155:137'] as Scope[]; // Same scope as existing session to trigger revocation
			const caipAccountIds = ['eip155:137:0x1234567890abcdef1234567890abcdef12345678'] as any;
			sdk = await createSDK(testOptions);

			const onConnectionSuccessSpy = t.vi.spyOn(sdk as any, 'onConnectionSuccess');

			let showModalPromise!: Promise<void>;
			let unloadSpy!: t.MockInstance<() => void>;

			if (platform !== 'web') {
				unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');
				showModalPromise = waitForInstallModal(sdk);
			}

			const connectPromise = sdk.connect(scopes, caipAccountIds);

			if (platform !== 'web') {
				//For MWP we simulate a connection with DappClient after showing the QRCode
				await expectUIFactoryRenderInstallModal(sdk);

				//Emit session_request QRCode back to Modal
				await mockedData.mockDappClient.emit('session_request', mockSessionData);
				// Connect to MWP using dappClient mock
				await mockedData.mockDappClient.connect();
				await showModalPromise;

				// Should have unloaded the modal and calling successCallback
				t.expect(unloadSpy).toHaveBeenCalledWith(true);
				t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
			}
			await connectPromise;

			// Now test the connect flow with session creation error
			await t.expect(mockedData.mockLogger).toHaveBeenCalledWith('MetaMaskSDK error during onConnectionSuccess', revocationError);
		});

		t.it(`${platform} should disconnect transport successfully`, async () => {
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			mockedData.mockTransport.isConnected.mockReturnValue(true);
			mockMultichainClient.getSession.mockResolvedValue(undefined);
			mockMultichainClient.revokeSession.mockReset();

			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);

			sdk = await createSDK(testOptions);
			await sdk.disconnect();
			t.expect(mockedData.mockTransport.disconnect).toHaveBeenCalled();
		});

		t.it(`${platform} should handle disconnect errors`, async () => {
			const scopes = ['eip155:137'] as Scope[]; // Same scope as existing session to trigger revocation
			const caipAccountIds = ['eip155:137:0x1234567890abcdef1234567890abcdef12345678'] as any;

			const disconnectError = new Error('Failed to disconnect transport');
			mockedData.mockTransport.disconnect.mockRejectedValue(disconnectError);

			sdk = await createSDK(testOptions);
			const onConnectionSuccessSpy = t.vi.spyOn(sdk as any, 'onConnectionSuccess');

			let showModalPromise!: Promise<void>;
			let unloadSpy!: t.MockInstance<() => void>;

			if (platform !== 'web') {
				unloadSpy = t.vi.spyOn((sdk as any).options.ui.factory, 'unload');
				showModalPromise = waitForInstallModal(sdk);
			}

			const connectPromise = sdk.connect(scopes, caipAccountIds);

			if (platform !== 'web') {
				//For MWP we simulate a connection with DappClient after showing the QRCode
				await expectUIFactoryRenderInstallModal(sdk);

				//Emit session_request QRCode back to Modal
				await mockedData.mockDappClient.emit('session_request', mockSessionData);
				// Connect to MWP using dappClient mock
				await mockedData.mockDappClient.connect();
				await showModalPromise;

				// Should have unloaded the modal and calling successCallback
				t.expect(unloadSpy).toHaveBeenCalledWith(true);
				t.expect(onConnectionSuccessSpy).toHaveBeenCalled();
			}
			await connectPromise;
			await t.expect(sdk.disconnect()).rejects.toThrow('Failed to disconnect transport');
		});
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = {
	dapp: exampleDapp,
} as any;

runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
