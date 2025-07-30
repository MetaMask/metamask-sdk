/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import type { MultiChainFNOptions, MultichainCore } from './domain';
import { runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv, type MockedData, mockSessionData, type TestSuiteOptions } from './fixtures.test';
import { MultichainSDK } from './multichain';

// Carefull, order of import matters to keep mocks working
import { analytics } from '@metamask/sdk-analytics';
import * as loggerModule from './domain/logger';
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

		t.it(`${platform} should automatically initialise the SDK after creation`, async () => {
			sdk = await createSDK(testOptions);
			t.expect(mockedData.initSpy).toHaveBeenCalled();
		});

		t.it(`${platform} should enable analytics by default if platform is not nodejs`, async () => {
			sdk = await createSDK(testOptions);
			t.expect(mockedData.setupAnalyticsSpy).toHaveBeenCalled();

			if (platform !== 'web') {
				t.expect(analytics.enable).not.toHaveBeenCalled();
				t.expect(analytics.track).not.toHaveBeenCalled();
			} else {
				t.expect(analytics.enable).toHaveBeenCalled();
				t.expect(analytics.track).toHaveBeenCalledWith('sdk_initialized', {});
			}
		});

		t.it(`${platform} should NOT call analytics.enable if analytics is DISABLED`, async () => {
			(testOptions.analytics as any).enabled = false;
			sdk = await createSDK(testOptions);
			t.expect(sdk).toBeDefined();
			t.expect(mockedData.initSpy).toHaveBeenCalled();
			t.expect(mockedData.setupAnalyticsSpy).toHaveBeenCalled();
			t.expect(analytics.enable).not.toHaveBeenCalled();
			t.expect(analytics.track).not.toHaveBeenCalled();
		});

		t.it(`${platform} should call init and setupAnalytics with logger configuration`, async () => {
			const mockLogger = (loggerModule as any).__mockLogger;

			sdk = await createSDK(testOptions);
			t.expect(sdk).toBeDefined();
			t.expect(mockLogger).not.toHaveBeenCalled();

			t.expect(mockedData.initSpy).toHaveBeenCalled();
			t.expect(mockedData.setupAnalyticsSpy).toHaveBeenCalled();
			t.expect(sdk.state).toBe('loaded');
			t.expect(loggerModule.enableDebug).toHaveBeenCalledWith('metamask-sdk:core');
		});

		t.it(`${platform} should properly initialize if existing session transport if found during init`, async () => {
			// Set the transport type as a string in storage (this is how it's stored)
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockMultichainClient.getSession.mockResolvedValue(mockSessionData);

			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('loaded');
			t.expect(sdk.transport).toBeDefined();
			t.expect(sdk.provider).toBeDefined();
			t.expect(sdk.storage).toBeDefined();

			// Verify that the session was retrieved during initialization
			t.expect(mockedData.mockMultichainClient.getSession).toHaveBeenCalled();
			t.expect(mockedData.mockTransport.isConnected).toHaveBeenCalled();
			t.expect(mockedData.mockTransport.connect).toHaveBeenCalled();
		});

		t.it(`${platform} should emit sessionChanged event when existing valid session is found during init`, async () => {
			// Set the transport type as a string in storage (this is how it's stored)
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			// Spy on the MultichainSDK's emit method before creating the SDK
			const emitSpy = t.vi.spyOn(MultichainSDK.prototype, 'emit');

			sdk = await createSDK(testOptions);

			t.expect(sdk).toBeDefined();
			t.expect(sdk.state).toBe('loaded');

			// Check that sessionChanged event was emitted with the expected session data during initialization
			t.expect(emitSpy).toHaveBeenCalledWith('session_changed', mockSessionData);

			// Restore the spy
			emitSpy.mockRestore();
		});

		t.it(`${platform} Should gracefully handle init errors by just logging them and return non initialized sdk`, async () => {
			const testError = new Error('Test error');

			mockedData.setupAnalyticsSpy.mockImplementation(() => {
				throw testError;
			});

			sdk = await createSDK(testOptions);

			t.expect(sdk).toBeDefined();
			t.expect(sdk.state).toBe('pending');

			// Access the mock logger from the module
			const mockLogger = (loggerModule as any).__mockLogger;

			// Verify that the logger was called with the error
			t.expect(mockLogger).toHaveBeenCalledWith('MetaMaskSDK error during initialization', testError);
		});
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = { dapp: exampleDapp };

runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
runTestsInWebEnv(baseTestOptions, testSuite, 'https://dapp.io/');
