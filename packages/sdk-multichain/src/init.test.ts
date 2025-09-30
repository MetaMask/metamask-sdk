/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import type { MultichainOptions, MultichainCore } from './domain';
import { runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv, runTestsInWebMobileEnv } from '../tests/fixtures.test';

// Carefull, order of import matters to keep mocks working
import { analytics } from '@metamask/sdk-analytics';
import * as loggerModule from './domain/logger';
import type { TestSuiteOptions, MockedData } from '../tests/types';
import { mockSessionData } from '../tests/data';

function testSuite<T extends MultichainOptions>({ platform, createSDK, options: sdkOptions, ...options }: TestSuiteOptions<T>) {
	const { beforeEach, afterEach } = options;
	const originalSdkOptions = sdkOptions;
	let sdk: MultichainCore;

	t.describe(`${platform} tests`, () => {
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
			testOptions = {
				...originalSdkOptions,
				ui: uiOptions,
				analytics: {
					...originalSdkOptions.analytics,
					enabled: platform === 'web',
					integrationType: 'test',
				},
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
			} else {
				t.expect(analytics.enable).toHaveBeenCalled();
			}
			t.expect(analytics.track).toHaveBeenCalledWith('sdk_initialized', {});
		});

		t.it(`${platform} should NOT call analytics.enable if analytics is DISABLED but trigger event anyways`, async () => {
			(testOptions.analytics as any).enabled = false;
			sdk = await createSDK(testOptions);
			t.expect(sdk).toBeDefined();
			t.expect(mockedData.initSpy).toHaveBeenCalled();
			t.expect(mockedData.setupAnalyticsSpy).toHaveBeenCalled();
			t.expect(analytics.enable).not.toHaveBeenCalled();
			t.expect(analytics.track).toHaveBeenCalled();
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

		t.it(`${platform} should properly initialize if no transport is found during init`, async () => {
			sdk = await createSDK(testOptions);
			t.expect(sdk.state).toBe('loaded');
			t.expect(() => sdk.transport).toThrow();
		});

		t.it(`${platform} should properly initialize if existing session transport if found during init`, async () => {
			// Set the transport type as a string in storage (this is how it's stored)
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockWalletGetSession.mockImplementation(() => mockSessionData);

			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('connected');

			t.expect(sdk.transport).toBeDefined();
			t.expect(sdk.storage).toBeDefined();
		});

		t.it(`${platform} should emit sessionChanged event when existing valid session is found during init`, async () => {
			// Set the transport type as a string in storage (this is how it's stored)
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockWalletGetSession.mockImplementation(() => mockSessionData);

			const onNotification = t.vi.fn();
			const optionsWithEvent = {
				...testOptions,
				transport: {
					...(testOptions.transport ?? {}),
					onNotification: onNotification,
				},
			};
			sdk = await createSDK(optionsWithEvent);

			t.expect(sdk).toBeDefined();
			t.expect(sdk.state).toBe('connected');
			t.expect(onNotification).toHaveBeenCalledWith({
				method: 'wallet_sessionChanged',
				params: mockSessionData,
			});
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

const baseTestOptions = { dapp: exampleDapp } as any;

runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
runTestsInWebMobileEnv(baseTestOptions, testSuite, exampleDapp.url);
