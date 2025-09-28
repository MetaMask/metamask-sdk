/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import { vi } from 'vitest';
import type { InvokeMethodOptions, MultichainOptions, MultichainCore, Scope } from './domain';
// Carefull, order of import matters to keep mocks working
import { runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv } from '../tests/fixtures.test';
import { Store } from './store';
import { mockSessionData, mockSessionRequestData } from '../tests/data';
import type { TestSuiteOptions, MockedData } from '../tests/types';

vi.mock('cross-fetch', () => {
	const mockFetch = vi.fn();
	return {
		default: mockFetch,
		__mockFetch: mockFetch,
	};
});

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

		t.it(`${platform} should invoke method successfully from provider with an active session and connected transport`, async () => {
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockSessionRequest.mockImplementation(() => mockSessionRequestData);
			mockedData.mockWalletGetSession.mockImplementation(() => undefined as any);
			mockedData.mockWalletCreateSession.mockImplementation(() => mockSessionData);
			mockedData.mockWalletInvokeMethod.mockImplementation(() => 'success');

			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('loaded');

			await sdk.connect(scopes, caipAccountIds);

			t.expect(sdk.state).toBe('connected');
			t.expect(sdk.storage).toBeDefined();
			t.expect(sdk.transport).toBeDefined();

			const providerInvokeMethodSpy = t.vi.spyOn(sdk.provider, 'invokeMethod');
			const options = {
				scope: 'eip155:1',
				request: { method: 'eth_accounts', params: [] },
			} as InvokeMethodOptions;
			const result = await sdk.invokeMethod(options);
			t.expect(providerInvokeMethodSpy).toHaveBeenCalledWith(options);
			t.expect(result).toEqual('success');
		});

		t.it(`${platform} should reject invoke if no active session or provider is available`, async () => {
			sdk = await createSDK(testOptions);
			const options = {
				scope: 'eip155:1',
				request: { method: 'eth_accounts', params: [] },
			} as InvokeMethodOptions;
			await t.expect(sdk.invokeMethod(options)).rejects.toThrow('Provider not initialized, establish connection first');
		});

		t.it(`${platform} should invoke readonly method successfully from client if infuraAPIKey exists`, async () => {
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockSessionRequest.mockImplementation(() => mockSessionRequestData);
			mockedData.mockWalletGetSession.mockImplementation(() => mockSessionData);

			// Mock the RPCClient response
			const mockJsonResponse = { result: 'success' };
			const fetchModule = await import('cross-fetch');
			const mockFetch = (fetchModule as any).__mockFetch;
			const mockResponse = {
				ok: true,
				json: t.vi.fn().mockResolvedValue({ result: mockJsonResponse }),
			};

			mockFetch.mockResolvedValue(mockResponse);

			sdk = await createSDK({
				...testOptions,
				api: {
					...testOptions.api,
					infuraAPIKey: '1234567890',
				},
			});

			t.expect(sdk.state).toBe('connected');

			const providerInvokeMethodSpy = t.vi.spyOn(sdk.provider, 'invokeMethod');
			const options = {
				scope: 'eip155:1',
				request: { method: 'eth_accounts', params: [] },
			} as InvokeMethodOptions;
			const result = await sdk.invokeMethod(options);

			t.expect(providerInvokeMethodSpy).not.toHaveBeenCalled();
			t.expect(mockFetch).toHaveBeenCalled();
			t.expect(result).toEqual(mockJsonResponse);
		});

		t.it(`${platform} should handle invoke method errors`, async () => {
			const mockError = new Error('Failed to invoke method');
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);

			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockSessionRequest.mockImplementation(() => mockSessionRequestData);
			mockedData.mockWalletGetSession.mockImplementation(() => mockSessionData);
			mockedData.mockWalletInvokeMethod.mockRejectedValue(mockError);

			sdk = await createSDK(testOptions);
			const options = {
				scope: 'eip155:1',
				request: {
					method: 'eth_accounts',
					params: [],
				},
			} as InvokeMethodOptions;
			t.expect(sdk.state).toBe('connected');
			t.expect(sdk.provider).toBeDefined();

			await t.expect(sdk.invokeMethod(options)).rejects.toThrow('Failed to invoke method');
		});
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = { dapp: exampleDapp } as any;

runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
