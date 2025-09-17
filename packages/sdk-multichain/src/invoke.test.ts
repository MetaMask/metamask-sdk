/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import { vi } from 'vitest';
import type { InvokeMethodOptions, MultiChainFNOptions, MultichainCore } from './domain';
// Carefull, order of import matters to keep mocks working
import { mockSessionData, runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv, type MockedData, type TestSuiteOptions } from './fixtures.test';
import { Store } from './store';

vi.mock('cross-fetch', () => {
	const mockFetch = vi.fn();
	return {
		default: mockFetch,
		__mockFetch: mockFetch,
	};
});

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

		t.it(`${platform} should invoke method successfully from provider with an active session and connected transport`, async () => {
			// Mock the RPCClient response
			const mockResponse = { id: 1, jsonrpc: '2.0' as const, result: 'success' };
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockTransport.request.mockResolvedValue(mockResponse);
			mockedData.mockTransport.isConnected.mockReturnValue(true);
			mockedData.mockMultichainClient.getSession.mockResolvedValue(mockSessionData);

			sdk = await createSDK(testOptions);
			const providerInvokeMethodSpy = t.vi.spyOn(sdk.provider, 'invokeMethod');
			const options = {
				scope: 'eip155:1',
				request: { method: 'eth_accounts', params: [] },
			} as InvokeMethodOptions;
			const result = await sdk.invokeMethod(options);
			t.expect(providerInvokeMethodSpy).toHaveBeenCalledWith(options);
			t.expect(result).toEqual(mockResponse);
		});

		t.it(`${platform} should reject invoke if no active session or provider is available`, async () => {
			mockedData.nativeStorageStub.removeItem('multichain-transport');

			mockedData.mockTransport.isConnected.mockReturnValue(false);
			mockedData.mockTransport.connect.mockResolvedValue();
			mockedData.mockMultichainClient.getSession.mockResolvedValue(undefined);

			sdk = await createSDK(testOptions);

			const options = {
				scope: 'eip155:1',
				request: { method: 'eth_accounts', params: [] },
			} as InvokeMethodOptions;

			await t.expect(sdk.invokeMethod(options)).rejects.toThrow('Provider not initialized, establish connection first');
		});

		t.it(`${platform} should invoke readonly method successfully from client if infuraAPIKey exists`, async () => {
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
			mockedData.mockTransport.request.mockRejectedValue(mockError);
			mockedData.mockTransport.isConnected.mockReturnValue(true);
			mockedData.mockMultichainClient.getSession.mockResolvedValue(mockSessionData);
			sdk = await createSDK(testOptions);
			const options = {
				scope: 'eip155:1',
				request: {
					method: 'eth_accounts',
					params: [],
				},
			} as InvokeMethodOptions;
			await t.expect(sdk.invokeMethod(options)).rejects.toThrow('Failed to invoke method');
		});
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = { dapp: exampleDapp } as any;

runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
