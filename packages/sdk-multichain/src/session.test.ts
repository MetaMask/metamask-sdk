/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import type { MultichainOptions, MultichainCore, Scope, SessionData } from './domain';
// Carefull, order of import matters to keep mocks working
import { runTestsInNodeEnv, runTestsInRNEnv, runTestsInWebEnv, runTestsInWebMobileEnv } from '../tests/fixtures.test';

import { Store } from './store';

import type { TestSuiteOptions, MockedData } from '../tests/types';
import { mockSessionData, mockSessionRequestData } from '../tests/data';
import { SessionStore } from '@metamask/mobile-wallet-protocol-core';

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

		t.it(`${platform} should handle session upgrades`, async () => {
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
			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockWalletGetSession.mockImplementation(async () => mockSessionData);
			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
			mockedData.mockWalletCreateSession.mockImplementation(async () => mockedSessionUpgradeData);

			t.vi.spyOn(SessionStore.prototype, 'list').mockImplementation(async () => Promise.resolve([await (mockedData as any).mockWalletGetSession()]));

			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('connected');
			t.expect(sdk.transport).toBeDefined();
			t.expect(() => sdk.provider).toThrow();
			t.expect(sdk.storage).toBeDefined();
			await t.expect(sdk.storage.getTransport()).resolves.toBe(transportString);

			mockedData.mockDefaultTransport.request.mockClear();
			mockedData.mockDappClient.sendRequest.mockClear();

			await sdk.connect(scopes, caipAccountIds);

			if (platform === 'web') {
				t.expect(mockedData.mockDefaultTransport.request).toHaveBeenCalledWith(
					t.expect.objectContaining({
						jsonrpc: '2.0',
						method: 'wallet_getSession',
					}),

					undefined,
				);
				t.expect(mockedData.mockDefaultTransport.request).toHaveBeenCalledWith(
					t.expect.objectContaining({
						method: 'wallet_revokeSession',
						params: mockSessionData,
					}),
					undefined,
				);

				t.expect(mockedData.mockDefaultTransport.request).toHaveBeenCalledWith(
					t.expect.objectContaining({
						method: 'wallet_createSession',
						params: {
							optionalScopes: mockedSessionUpgradeData.sessionScopes,
						},
					}),
					undefined,
				);
			} else {
				t.expect(mockedData.mockDappClient.sendRequest).toHaveBeenCalledWith(
					t.expect.objectContaining({
						method: 'wallet_getSession',
					}),
				);
				t.expect(mockedData.mockDappClient.sendRequest).toHaveBeenCalledWith(
					t.expect.objectContaining({
						method: 'wallet_revokeSession',
						params: mockSessionData,
					}),
				);
				t.expect(mockedData.mockDappClient.sendRequest).toHaveBeenCalledWith(
					t.expect.objectContaining({
						method: 'wallet_createSession',
						params: {
							optionalScopes: mockedSessionUpgradeData.sessionScopes,
						},
					}),
				);
			}
		});

		t.it(`${platform} should handle session retrieval when no session exists`, async () => {
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			mockedData.nativeStorageStub.setItem('multichain-transport', transportString);
			mockedData.mockWalletGetSession.mockImplementation(() => undefined as any);
			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
			mockedData.mockWalletCreateSession.mockImplementation(async () => mockSessionData);

			sdk = await createSDK(testOptions);
			t.expect(sdk.state).toBe('connected');

			t.expect(sdk).toBeDefined();
			t.expect(sdk.transport).toBeDefined();
			t.expect(sdk.storage).toBeDefined();

			await sdk.connect(scopes, caipAccountIds);

			/**
			 * We expect the default transport to be called when on web and mobile wallet protocol for the rest
			 */
			if (platform === 'web') {
				t.expect(mockedData.mockDefaultTransport.request).toHaveBeenCalledWith(
					t.expect.objectContaining({
						jsonrpc: '2.0',
						method: 'wallet_getSession',
					}),
					undefined,
				);
				t.expect(mockedData.mockDefaultTransport.request).toHaveBeenCalledWith(
					t.expect.objectContaining({
						method: 'wallet_createSession',
						params: {
							optionalScopes: mockSessionData.sessionScopes,
						},
					}),
					undefined,
				);
			} else {
				t.expect(mockedData.mockDappClient.sendRequest).toHaveBeenCalledWith(
					t.expect.objectContaining({
						method: 'wallet_createSession',
						params: {
							optionalScopes: {},
						},
					}),
				);
			}
		});

		t.it(`${platform} should handle provider errors during session retrieval`, async () => {
			const scopes = ['eip155:1'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'] as any;

			// Get mocks from the module mock
			const sessionError = new Error('Session error');
			mockedData.mockSessionRequest.mockImplementation(async () => mockSessionRequestData);
			mockedData.mockWalletCreateSession.mockRejectedValue(sessionError);
			mockedData.mockWalletGetSession.mockRejectedValue(sessionError);

			sdk = await createSDK(testOptions);

			t.expect(sdk).toBeDefined();
			t.expect(sdk.state === 'loaded').toBe(true);

			await t.expect(() => sdk.connect(scopes, caipAccountIds)).rejects.toThrow(sessionError);

			t.expect(sdk.state === 'loaded').toBe(true);
		});
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = { dapp: exampleDapp } as any;

runTestsInNodeEnv(baseTestOptions, testSuite);
runTestsInRNEnv(baseTestOptions, testSuite);
runTestsInWebEnv(baseTestOptions, testSuite, exampleDapp.url);
runTestsInWebMobileEnv(baseTestOptions, testSuite, exampleDapp.url);
