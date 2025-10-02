/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import { vi } from 'vitest';
import type { InvokeMethodOptions, MultichainOptions, MultichainCore, Scope } from './domain';
// Carefull, order of import matters to keep mocks working
import { runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv, runTestsInWebMobileEnv } from '../tests/fixtures.test';
import { Store } from './store';
import { mockSessionData, mockSessionRequestData } from '../tests/data';
import type { TestSuiteOptions, MockedData } from '../tests/types';
import { RPCClient } from './multichain/rpc/client';

vi.mock('cross-fetch', () => {
	const mockFetch = vi.fn();
	return {
		default: mockFetch,
		__mockFetch: mockFetch,
	};
});

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
		const isMWPPlatform = platform === 'web-mobile' || platform === 'rn' || platform === 'node';

		let mockedData: MockedData;
		let testOptions: T;
		const transportString = platform === 'web' ? 'browser' : 'mwp';

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

		t.it(`${platform} should invoke method successfully from provider with an active session and connected transport`, async () => {
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
			mockedData.mockWalletGetSession.mockImplementation(async () => undefined as any);
			mockedData.mockWalletCreateSession.mockImplementation(async () => mockSessionData);
			mockedData.mockWalletInvokeMethod.mockImplementation(async () => {
				return {
					id: 1,
					jsonrpc: '2.0',
					result: 'success',
				};
			});

			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('loaded');
			t.expect(() => sdk.provider).toThrow();
			t.expect(() => sdk.transport).toThrow();

			await sdk.connect(scopes, caipAccountIds);

			t.expect(sdk.state).toBe('connected');
			t.expect(sdk.storage).toBeDefined();
			t.expect(sdk.transport).toBeDefined();

			const providerInvokeMethodSpy = t.vi.spyOn(RPCClient.prototype, 'invokeMethod');
			const options = {
				id: 1,
				scope: 'eip155:1',
				request: { method: 'eth_accounts', params: [] },
			} as InvokeMethodOptions;

			const result = await sdk.invokeMethod(options);
			t.expect(providerInvokeMethodSpy).toHaveBeenCalledWith(options);
			t.expect(result).toEqual({
				id: 1,
				jsonrpc: '2.0',
				result: 'success',
			});
		});

		t.it(
			`${platform} should reject invoke in case of failure in RPCClient`,
			async () => {
				const scopes = ['eip155:1'] as Scope[];
				const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;
				mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
				mockedData.mockWalletGetSession.mockImplementation(async () => mockSessionData);
				mockedData.mockWalletCreateSession.mockImplementation(async () => mockSessionData);
				mockedData.mockWalletInvokeMethod.mockRejectedValue(new Error('Failed to invoke method'));

				sdk = await createSDK(testOptions);
				await sdk.connect(scopes, caipAccountIds);
				t.expect(sdk.state).toBe('connected');

				const options = {
					scope: 'eip155:1',
					request: { method: 'eth_accounts', params: [] },
				} as InvokeMethodOptions;

				await t.expect(sdk.invokeMethod(options)).rejects.toThrow('RPCErr53: RPC Client invoke method reason (Failed to invoke method)');
			},
			{ timeout: 100000 },
		);

		t.it(`${platform} should invoke readonly method successfully from client if infuraAPIKey exists`, async () => {
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
			mockedData.mockWalletGetSession.mockImplementation(async () => mockSessionData);
			mockedData.mockWalletCreateSession.mockImplementation(async () => mockSessionData);

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

			t.expect(sdk.state).toBe('loaded');
			t.expect(() => sdk.provider).toThrow();
			t.expect(() => sdk.transport).toThrow();

			await sdk.connect(scopes, caipAccountIds);

			t.expect(sdk.state).toBe('connected');

			const options = { scope: 'eip155:1', request: { method: 'eth_accounts', params: [] } } as InvokeMethodOptions;
			const result = await sdk.invokeMethod(options);

			t.expect(mockFetch).toHaveBeenCalled();
			t.expect(result).toEqual(mockJsonResponse);
		});

		t.it(`${platform} should handle invoke method errors`, async () => {
			const mockError = new Error('Failed to invoke method');
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);

			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
			mockedData.mockWalletGetSession.mockImplementation(async () => mockSessionData);
			mockedData.mockWalletInvokeMethod.mockRejectedValue(mockError);
			mockedData.mockWalletCreateSession.mockImplementation(async () => mockSessionData);

			sdk = await createSDK(testOptions);
			const options = {
				scope: 'eip155:1',
				request: {
					method: 'eth_accounts',
					params: [],
				},
			} as InvokeMethodOptions;
			t.expect(sdk.state).toBe('connected');
			t.expect(() => sdk.provider).toThrow();

			await t.expect(sdk.invokeMethod(options)).rejects.toThrow('Failed to invoke method');
		});
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = { dapp: exampleDapp } as any;

runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
runTestsInWebMobileEnv(baseTestOptions, testSuite, exampleDapp.url);
