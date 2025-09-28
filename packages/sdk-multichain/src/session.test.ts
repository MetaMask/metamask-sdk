/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import type { MultichainOptions, MultichainCore, Scope, SessionData } from './domain';
// Carefull, order of import matters to keep mocks working
import { runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv, runTestsInWebMobileEnv } from '../tests/fixtures.test';

import { Store } from './store';

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
			mockedData = await beforeEach();

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
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockWalletGetSession.mockImplementation(() => mockSessionData);

			sdk = await createSDK(testOptions);
			t.expect(sdk.state).toBe('connected');

			const scopes = ['eip155:1', 'eip155:137'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678', 'eip155:137:0x1234567890abcdef1234567890abcdef12345678'] as any;
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
			mockedData.mockWalletCreateSession.mockImplementation(() => mockedSessionUpgradeData);
			const transporRequesttSpy = t.vi.spyOn(sdk.transport, 'request');
			await sdk.connect(scopes, caipAccountIds);

			t.expect(transporRequesttSpy).toHaveBeenCalledWith({
				method: 'wallet_getSession',
			});
			t.expect(transporRequesttSpy).toHaveBeenCalledWith({
				method: 'wallet_revokeSession',
				params: mockSessionData,
			});

			t.expect(mockedData.emitSpy).toHaveBeenCalledWith('wallet_sessionChanged', mockedSessionUpgradeData);
		});

		t.it(`${platform} should handle session retrieval when no session exists`, async () => {
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockWalletGetSession.mockImplementation(() => undefined as any);

			sdk = await createSDK(testOptions);
			t.expect(sdk.state).toBe('loaded');

			t.expect(sdk).toBeDefined();
			t.expect(sdk.transport).toBeDefined();
			t.expect(sdk.storage).toBeDefined();

			/**
			 * We expect the default transport to be called when on web and mobile wallet protocol for the rest
			 */
			if (platform === 'web') {
				t.expect(mockedData.mockDefaultTransport.request).toHaveBeenCalledWith({
					method: 'wallet_getSession',
				});
			} else {
				t.expect(mockedData.mockDappClient.sendRequest).toHaveBeenCalledWith({
					id: '0',
					jsonrpc: '2.0',
					method: 'wallet_getSession',
				});
			}
		});

		t.it(`${platform} should handle provider errors during session retrieval`, async () => {
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);

			// Get mocks from the module mock
			const sessionError = new Error('Session error');

			mockedData.mockWalletGetSession.mockRejectedValue(sessionError);

			sdk = await createSDK(testOptions);

			t.expect(sdk).toBeDefined();
			t.expect(sdk.state === 'pending').toBe(true);

			t.expect(mockedData.mockLogger).toHaveBeenCalledWith('MetaMaskSDK error during initialization', sessionError);
		});
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = { dapp: exampleDapp } as any;

runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
runTestsInWebMobileEnv(baseTestOptions, testSuite, exampleDapp.url);
