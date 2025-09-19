/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import type { MultiChainFNOptions, MultichainCore } from './domain';
import { runTestsInNodeEnv, type MockedData, mockSessionData, type TestSuiteOptions, runTestsInRNEnv, runTestsInWebEnv } from './fixtures.test';

// Carefull, order of import matters to keep mocks working
import { analytics } from '@metamask/sdk-analytics';
import * as loggerModule from './domain/logger';

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

		t.it(`${platform} should properly initialize if existing session transport if found during init`, async () => {
			// Set the transport type as a string in storage (this is how it's stored)
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockMultichainClient.getSession.mockResolvedValue(mockSessionData);

			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('loaded');

			await sdk.connect(['eip155:1'], ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any);

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

			const onNotification = t.vi.fn();

			const optionsWithEvent = {
				...testOptions,
				onNotification,
			};
			sdk = await createSDK(optionsWithEvent);

			t.expect(sdk).toBeDefined();
			t.expect(sdk.state).toBe('loaded');

			mockedData.mockTransport.__triggerNotification({
				method: 'session_changed',
				params: {
					session: mockSessionData,
				},
			});

			// Check that sessionChanged event was emitted with the expected session data during initialization
			t.expect(mockedData.emitSpy).toHaveBeenCalledWith('session_changed', mockSessionData);
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

runTestsInWebEnv(baseTestOptions, testSuite, 'https://dapp.io/');
runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
