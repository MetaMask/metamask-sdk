/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import fs from 'node:fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JSDOM as Page } from 'jsdom';
import * as t from 'vitest';
import type { MultiChainFNOptions, MultichainCore, Scope, SessionData } from './domain';
// Carefull, order of import matters to keep mocks working
import { createTest, type MockedData, mockSessionData, type TestSuiteOptions } from './fixtures.test';
import { createMetamaskSDK as createMetamaskSDKWeb } from './index.browser';
import { createMetamaskSDK as createMetamaskSDKRN } from './index.native';
import { createMetamaskSDK as createMetamaskSDKNode } from './index.node';
import * as nodeStorage from './store/adapters/node';
import * as rnStorage from './store/adapters/rn';
import * as webStorage from './store/adapters/web';

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
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			mockedData.mockTransport.connect.mockResolvedValue();
			mockMultichainClient.getSession.mockResolvedValue(mockSessionData);

			sdk = await createSDK(testOptions);

			t.expect(sdk.state).toBe('loaded');
			t.expect(sdk.provider).toBeDefined();
			t.expect(sdk.transport).toBeDefined();
			t.expect(sdk.storage).toBeDefined();
			t.expect(mockedData.mockTransport.connect).toHaveBeenCalled();
			t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
			t.expect(mockedData.emitSpy).toHaveBeenCalledWith('session_changed', mockSessionData);

			const mockedSessionUpgradeData: SessionData = {
				...mockSessionData,
				sessionScopes: {
					...mockSessionData.sessionScopes,
					'eip155:137': {
						methods: [],
						notifications: [],
						accounts: ['eip155:137:0x1234567890abcdef1234567890abcdef12345678'],
					},
				},
			};
			const scopes = ['eip155:1', 'eip155:137'] as Scope[];
			const caipAccountIds = ['eip155:1:0x1234567890abcdef1234567890abcdef12345678', 'eip155:137:0x1234567890abcdef1234567890abcdef12345678'] as any;
			// Mock createSession to return the upgraded session data
			mockMultichainClient.createSession.mockResolvedValue(mockedSessionUpgradeData);

			await sdk.connect(scopes, caipAccountIds);

			t.expect(mockMultichainClient.revokeSession).toHaveBeenCalled();
			t.expect(mockMultichainClient.createSession).toHaveBeenCalledWith({
				optionalScopes: mockedSessionUpgradeData.sessionScopes,
			});
			// sessionChanged should be emitted with the full session data returned from createSession, not just the scopes
			t.expect(mockedData.emitSpy).toHaveBeenCalledWith('session_changed', mockedSessionUpgradeData);
		});

		t.it(`${platform} should handle session retrieval when no session exists`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

			// Mock no session scenario
			mockMultichainClient.getSession.mockResolvedValue(undefined);

			sdk = await createSDK(testOptions);

			t.expect(sdk).toBeDefined();
			t.expect(sdk.state).toBe('loaded');
			t.expect(sdk.provider).toBeDefined();
			t.expect(sdk.transport).toBeDefined();
			t.expect(sdk.storage).toBeDefined();
			t.expect(sdk.state).toBe('loaded');
			t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
		});

		t.it(`${platform} should handle provider errors during session retrieval`, async () => {
			// Get mocks from the module mock
			const multichainModule = await import('@metamask/multichain-api-client');
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;
			const sessionError = new Error('Session error');

			// Clear previous calls and set up the error mock
			t.vi.clearAllMocks();
			mockMultichainClient.getSession.mockRejectedValue(sessionError);

			sdk = await createSDK(testOptions);

			t.expect(sdk).toBeDefined();
			t.expect(sdk.state === 'loaded').toBe(true);

			// Access the mock logger from the module
			const mockLogger = (loggerModule as any).__mockLogger;

			// Verify that the logger was called with the error
			t.expect(mockLogger).toHaveBeenCalledWith('MetaMaskSDK error during getCurrentSession', sessionError);
		});
	});
}

const exampleDapp = { name: 'Test Dapp', url: 'https://test.dapp' };

const baseTestOptions = { options: { dapp: exampleDapp }, tests: testSuite };

createTest({
	...baseTestOptions,
	platform: 'node',
	createSDK: createMetamaskSDKNode,
	setupMocks: () => {
		const memfs = new Map<string, any>();
		t.vi.spyOn(fs, 'existsSync').mockImplementation((path) => memfs.has(path.toString()));
		t.vi.spyOn(fs, 'writeFileSync').mockImplementation((path, data) => memfs.set(path.toString(), data));
		t.vi.spyOn(fs, 'readFileSync').mockImplementation((path) => memfs.get(path.toString()));
	},
});

createTest({
	...baseTestOptions,
	platform: 'rn',
	createSDK: createMetamaskSDKRN,
	setupMocks: (nativeStorageStub) => {
		t.vi.spyOn(AsyncStorage, 'getItem').mockImplementation(async (key) => nativeStorageStub.getItem(key));
		t.vi.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => nativeStorageStub.setItem(key, value));
		t.vi.spyOn(AsyncStorage, 'removeItem').mockImplementation(async (key) => nativeStorageStub.removeItem(key));
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
	},
});
