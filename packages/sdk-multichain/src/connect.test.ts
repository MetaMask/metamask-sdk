/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import type { MultiChainFNOptions, MultichainCore, Scope } from './domain';
// Carefull, order of import matters to keep mocks working
import { runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv, type MockedData, mockSessionData, type TestSuiteOptions } from './fixtures.test';
import { Store } from './store';

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
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
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
			mockedData.mockTransport.isConnected.mockReturnValue(false);

			// Create a new SDK instance with the mock configured correctly
			const sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('loaded');
			t.expect(sdk.provider).toBeDefined();
			t.expect(sdk.transport).toBeDefined();
			t.expect(sdk.storage).toBeDefined();
			t.expect(mockedData.mockTransport.connect).toHaveBeenCalled();
			t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
			t.expect(mockedData.emitSpy).not.toHaveBeenCalled();

			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			await sdk.connect(scopes, caipAccountIds);

			t.expect(mockedData.mockTransport.connect).toHaveBeenCalled();
			t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
			t.expect(mockMultichainClient.revokeSession).not.toHaveBeenCalled();
			t.expect(mockMultichainClient.createSession).toHaveBeenCalledWith({
				optionalScopes: {
					'eip155:1': {
						methods: [],
						notifications: [],
						accounts: ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'],
					},
				},
			});
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
			t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
			t.expect(mockedData.emitSpy).toHaveBeenCalledWith('session_changed', mockSessionData);

			mockedData.mockTransport.connect.mockReset();

			await sdk.connect(scopes, caipAccountIds);
			t.expect(mockedData.mockTransport.connect).not.toHaveBeenCalled();
		});

		t.it(`${platform} should handle invalid CAIP account IDs gracefully`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			mockedData.mockTransport.isConnected.mockReturnValue(false);
			mockMultichainClient.getSession.mockResolvedValue(undefined);

			// Mock console.error to capture invalid account ID errors
			const consoleErrorSpy = t.vi.spyOn(console, 'error').mockImplementation(() => {});

			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['invalid-account-id', 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;
			sdk = await createSDK(testOptions);
			await sdk.connect(scopes, caipAccountIds);

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
			mockedData.mockTransport.isConnected.mockReturnValue(false);
			mockedData.mockTransport.connect.mockRejectedValue(connectionError);

			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;
			sdk = await createSDK(testOptions);
			await t.expect(sdk.connect(scopes, caipAccountIds)).rejects.toThrow('Failed to connect transport');
		});

		t.it(`${platform} should handle session creation errors`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			mockedData.mockTransport.isConnected.mockReturnValue(true);
			mockMultichainClient.getSession.mockResolvedValue(undefined);

			const sessionError = new Error('Failed to create session');
			mockMultichainClient.createSession.mockRejectedValue(sessionError);

			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;
			sdk = await createSDK(testOptions);
			await t.expect(sdk.connect(scopes, caipAccountIds)).rejects.toThrow('Failed to create session');
		});

		t.it(`${platform} should handle session revocation errors`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			mockedData.mockTransport.isConnected.mockReturnValue(true);

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
			await t.expect(sdk.connect(scopes, caipAccountIds)).rejects.toThrow('Failed to revoke session');
		});

		t.it(`${platform} should disconnect transport successfully`, async () => {
			mockedData.mockTransport.isConnected.mockReturnValue(true);
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);

			sdk = await createSDK(testOptions);
			await sdk.disconnect();
			t.expect(mockedData.mockTransport.disconnect).toHaveBeenCalled();
		});

		t.it(`${platform} should handle disconnect errors`, async () => {
			mockedData.mockTransport.isConnected.mockReturnValue(true);
			const disconnectError = new Error('Failed to disconnect transport');
			mockedData.mockTransport.disconnect.mockRejectedValue(disconnectError);
			sdk = await createSDK(testOptions);
			await t.expect(sdk.disconnect()).rejects.toThrow('Failed to disconnect transport');
		});
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = { dapp: exampleDapp };

runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
