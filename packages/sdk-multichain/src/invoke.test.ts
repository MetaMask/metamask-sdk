/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import fs from 'node:fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JSDOM as Page } from 'jsdom';
import * as t from 'vitest';
import { vi } from 'vitest';
import type { InvokeMethodOptions, MultiChainFNOptions, MultichainCore } from './domain';
// Carefull, order of import matters to keep mocks working
import { createTest, type MockedData, type TestSuiteOptions } from './fixtures.test';
import { createMetamaskSDK as createMetamaskSDKWeb } from './index.browser';
import { createMetamaskSDK as createMetamaskSDKRN } from './index.native';
import { createMetamaskSDK as createMetamaskSDKNode } from './index.node';
import { Store } from './store';
import * as nodeStorage from './store/adapters/node';
import * as rnStorage from './store/adapters/rn';
import * as webStorage from './store/adapters/web';

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
				storage: new Store(mockedData.nativeStorageStub),
			};
		});

		t.afterEach(async () => {
			await afterEach(mockedData);
		});

		t.it(`${platform} should invoke method successfully from provider`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			// Mock the RPCClient response
			const mockResponse = { result: 'success' };
			(multichainModule as any).__mockInvokeResponse.mockResolvedValue(mockResponse);

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
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockError = new Error('Failed to invoke method');
			(multichainModule as any).__mockInvokeResponse.mockRejectedValue(mockError);
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

const baseTestOptions = { options: { dapp: exampleDapp }, tests: testSuite };

createTest({
	...baseTestOptions,
	platform: 'node',
	createSDK: createMetamaskSDKNode,
	setupMocks: (nativeStorageStub) => {
		const memfs = new Map<string, any>();
		t.vi.spyOn(fs, 'existsSync').mockImplementation((path) => memfs.has(path.toString()));
		t.vi.spyOn(fs, 'writeFileSync').mockImplementation((path, data) => memfs.set(path.toString(), data));
		t.vi.spyOn(fs, 'readFileSync').mockImplementation((path) => memfs.get(path.toString()));
		t.vi.spyOn(nodeStorage, 'StoreAdapterNode').mockImplementation(() => {
			return nativeStorageStub as any;
		});
	},
});

createTest({
	...baseTestOptions,
	platform: 'rn',
	createSDK: createMetamaskSDKRN,
	setupMocks: (nativeStorageStub) => {
		t.vi.spyOn(AsyncStorage, 'getItem').mockImplementation(async (key) => nativeStorageStub.getItem(key));
		t.vi.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => nativeStorageStub.setItem(key, value));
		t.vi.spyOn(AsyncStorage, 'removeItem').mockImplementation(async (key) => nativeStorageStub.deleteItem(key));
		t.vi.spyOn(rnStorage, 'StoreAdapterRN').mockImplementation(() => {
			return nativeStorageStub as any;
		});
	},
});

createTest({
	...baseTestOptions,
	platform: 'web',
	createSDK: createMetamaskSDKWeb,
	setupMocks: (nativeStorageStub) => {
		const dom = new Page('<!DOCTYPE html><p>Hello world</p>', {
			url: exampleDapp.url,
		});
		const globalStub = {
			...dom.window,
			addEventListener: t.vi.fn(),
			removeEventListener: t.vi.fn(),
			localStorage: nativeStorageStub,
			ethereum: {
				isMetaMask: true,
			},
		};
		t.vi.stubGlobal('navigator', {
			...dom.window.navigator,
			product: 'Chrome',
			language: 'en-US',
		});
		t.vi.stubGlobal('window', globalStub);
		t.vi.stubGlobal('location', dom.window.location);
		t.vi.stubGlobal('document', dom.window.document);
		t.vi.stubGlobal('HTMLElement', dom.window.HTMLElement);
		t.vi.stubGlobal('requestAnimationFrame', t.vi.fn());
		t.vi.spyOn(webStorage, 'StoreAdapterWeb').mockImplementation(() => {
			return nativeStorageStub as any;
		});
	},
});
