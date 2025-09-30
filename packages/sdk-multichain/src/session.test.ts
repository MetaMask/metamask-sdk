/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import type { MultichainOptions, MultichainCore, Scope, SessionData } from './domain';
// Carefull, order of import matters to keep mocks working
import { runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv, type MockedData, mockSessionData, type TestSuiteOptions } from './fixtures.test';

import * as loggerModule from './domain/logger';
import { Store } from './store';

function testSuite<T extends MultichainOptions>({ platform, createSDK, options: sdkOptions, ...options }: TestSuiteOptions<T>) {
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

		t.it(`${platform} should handle session upgrades`, async () => {
			const scopes = ['eip155:1', 'eip155:137'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678', 'eip155:137:0x1234567890abcdef1234567890abcdef12345678'] as any;
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;
			const mockedSessionUpgradeData: SessionData = {
				...mockSessionData,
				sessionScopes: {
					...mockSessionData.sessionScopes,
					'eip155:137': {
						accounts: ['eip155:137:0x1234567890abcdef1234567890abcdef12345678'],
						methods: [],
						notifications: [],
					},
				},
			};
			mockMultichainClient.getSession.mockResolvedValue(mockSessionData);

			mockedData.mockTransport.request.mockImplementation((input: any) => {
				if (input.method === 'wallet_getSession') {
					return Promise.resolve({
						id: 1,
						jsonrpc: '2.0',
						result: mockSessionData,
					});
				}

				if (input.method === 'wallet_createSession') {
					return Promise.resolve({
						id: 1,
						jsonrpc: '2.0',
						result: mockedSessionUpgradeData,
					});
				}

				if (input.method === 'wallet_revokeSession') {
					return Promise.resolve({ id: 1, jsonrpc: '2.0', result: mockSessionData });
				}
				return Promise.reject(new Error('Forgot to mock this RPC call?'));
			});

			sdk = await createSDK(testOptions);
			(mockedData.mockTransport as any)._isConnected = true;

			// Mock createSession to return the upgraded session data
			mockMultichainClient.createSession.mockResolvedValue({ data: mockedSessionUpgradeData });

			await sdk.connect(scopes, caipAccountIds);

			t.expect(mockedData.mockTransport.request).toHaveBeenCalledWith({
				method: 'wallet_getSession',
			});

			t.expect(mockedData.mockTransport.request).toHaveBeenCalledWith({
				method: 'wallet_revokeSession',
				params: mockSessionData,
			});

			mockedData.mockTransport.__triggerNotification({
				method: 'wallet_sessionChanged',
				params: {
					session: mockedSessionUpgradeData,
				},
			});
			// sessionChanged should be emitted with the full session data returned from createSession, not just the scopes
			t.expect(mockedData.emitSpy).toHaveBeenCalledWith('wallet_sessionChanged', mockedSessionUpgradeData);
		});

		t.it(`${platform} should handle session retrieval when no session exists`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			mockedData.mockTransport.request.mockImplementation((input: any) => {
				if (input.method === 'wallet_getSession') {
					return Promise.resolve({
						id: 1,
						jsonrpc: '2.0',
						result: undefined,
					});
				}

				return Promise.reject(new Error('Forgot to mock this RPC call?'));
			});

			// Mock no session scenario
			mockMultichainClient.getSession.mockResolvedValue(undefined);

			sdk = await createSDK(testOptions);

			t.expect(sdk).toBeDefined();
			t.expect(sdk.state).toBe('loaded');
			t.expect(sdk.provider).toBeDefined();
			t.expect(sdk.transport).toBeDefined();
			t.expect(sdk.storage).toBeDefined();
			t.expect(sdk.state).toBe('loaded');
			t.expect(mockedData.mockTransport.request).toHaveBeenCalledWith({
				method: 'wallet_getSession',
			});
		});

		t.it(`${platform} should handle provider errors during session retrieval`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;
			const sessionError = new Error('Session error');

			// Clear previous calls and set up the error mock
			t.vi.clearAllMocks();

			mockedData.mockTransport.request.mockImplementation(() => {
				return Promise.reject(sessionError);
			});
			mockMultichainClient.getSession.mockRejectedValue(sessionError);

			sdk = await createSDK(testOptions);

			t.expect(sdk).toBeDefined();
			t.expect(sdk.state === 'pending').toBe(true);

			// Access the mock logger from the module
			const mockLogger = (loggerModule as any).__mockLogger;

			// Verify that the logger was called with the error
			t.expect(mockLogger).toHaveBeenCalledWith('MetaMaskSDK error during initialization', sessionError);
		});
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = { dapp: exampleDapp } as any;

runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
