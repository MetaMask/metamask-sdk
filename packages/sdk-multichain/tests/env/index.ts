/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/suspicious/noAsyncPromiseExecutor: ok for tests */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import { vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JSDOM as Page } from 'jsdom';
import { NativeStorageStub } from 'tests/types';
import * as t from 'vitest';
import * as nodeStorage from '../../src/store/adapters/node';
import * as webStorage from '../../src/store/adapters/web';

export const TRANSPORT_REQUEST_RESPONSE_DELAY = 25;

/**
 * Virtualize nodejs environments, mocking everything needed to run the tests in Node
 */
export const setupNodeMocks = (nativeStorageStub: NativeStorageStub) => {
	// Mock console.log to prevent QR codes from displaying in test output
	vi.spyOn(console, 'log').mockImplementation(() => {});
	vi.spyOn(console, 'clear').mockImplementation(() => {});

	vi.spyOn(nodeStorage, 'StoreAdapterNode').mockImplementation(() => {
		const __storage = {
			get: t.vi.fn((key: string) => nativeStorageStub.getItem(key)),
			set: t.vi.fn((key: string, value: string) => nativeStorageStub.setItem(key, value)),
			delete: t.vi.fn((key: string) => nativeStorageStub.removeItem(key)),
			platform: 'node' as const,
			get storage() {
				return __storage;
			},
		} as any;
		return __storage;
	});
};

/**
 * Virtualize nodejs environments, mocking everything needed to run the tests in React Native
 */
export const setupRNMocks = (nativeStorageStub: NativeStorageStub) => {
	// Mock console.log to prevent QR codes from displaying in test output (for consistency)
	vi.spyOn(console, 'log').mockImplementation(() => {});
	vi.spyOn(console, 'clear').mockImplementation(() => {});

	vi.spyOn(AsyncStorage, 'getItem').mockImplementation(async (key) => nativeStorageStub.getItem(key));
	vi.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => nativeStorageStub.setItem(key, value));
	vi.spyOn(AsyncStorage, 'removeItem').mockImplementation(async (key) => nativeStorageStub.removeItem(key));
};

/**
 * Virtualize wev environments, mocking everything needed to run the tests in Web with Chrome extension available
 */
export const setupWebMocks = (nativeStorageStub: NativeStorageStub, dappUrl = 'https://test.dapp') => {
	const dom = new Page('<!DOCTYPE html><p>Hello world</p>', {
		url: dappUrl,
	});

	// Properly bind event methods to maintain context
	const globalStub = {
		...dom.window,
		addEventListener: dom.window.addEventListener.bind(dom.window),
		removeEventListener: dom.window.removeEventListener.bind(dom.window),
		dispatchEvent: dom.window.dispatchEvent.bind(dom.window),
		ethereum: {
			isMetaMask: true,
		}
	};
	vi.stubGlobal('navigator', {
		...dom.window.navigator,
		product: 'Chrome',
		language: 'en-US',
	});
	vi.stubGlobal('window', globalStub);
	vi.stubGlobal('location', dom.window.location);
	vi.stubGlobal('document', dom.window.document);
	vi.stubGlobal('HTMLElement', dom.window.HTMLElement);
	vi.stubGlobal('Event', dom.window.Event);
	vi.stubGlobal('requestAnimationFrame', t.vi.fn());
	vi.stubGlobal('dispatchEvent', dom.window.dispatchEvent.bind(dom.window));
	vi.spyOn(webStorage, 'StoreAdapterWeb').mockImplementation(() => {
		const __storage = {
			get: t.vi.fn((key: string) => {
				return nativeStorageStub.getItem(key);
			}),
			set: t.vi.fn((key: string, value: string) => {
				return nativeStorageStub.setItem(key, value);
			}),
			delete: t.vi.fn((key: string) => {
				return nativeStorageStub.removeItem(key);
			}),
			platform: 'web' as const,
			get storage() {
				return __storage;
			},
		} as any;
		return __storage;
	});
};



/**
 * Virtualize wev environments, mocking everything needed to run the tests in Web with Chrome extension available
 */
export const setupWebMobileMocks = (nativeStorageStub: NativeStorageStub, dappUrl = 'https://test.dapp') => {
	const dom = new Page('<!DOCTYPE html><p>Hello world</p>', {
		url: dappUrl,
	});

	const navigator = {
		...dom.window.navigator,
		product: 'Chrome',
		language: 'en-US',
		userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
	}

	// Mock location with proper href setter to avoid JSDOM navigation errors
	const mockLocation = {
		...dom.window.location,
		set href(value: string) {
			// Mock the href setter to avoid JSDOM navigation errors
			// In tests, we just track that it was called instead of actually navigating
		},
	};

	// Properly bind event methods to maintain context
	const globalStub = {
		...dom.window,
		addEventListener: dom.window.addEventListener.bind(dom.window),
		removeEventListener: dom.window.removeEventListener.bind(dom.window),
		dispatchEvent: dom.window.dispatchEvent.bind(dom.window),
		ethereum: {
			isMetaMask: true,
		},
		location: mockLocation,
		navigator
	};

	vi.stubGlobal('navigator', navigator);
	vi.stubGlobal('window', globalStub);
	vi.stubGlobal('location', mockLocation);
	vi.stubGlobal('document', dom.window.document);
	vi.stubGlobal('HTMLElement', dom.window.HTMLElement);
	vi.stubGlobal('Event', dom.window.Event);
	vi.stubGlobal('requestAnimationFrame', t.vi.fn());
	vi.stubGlobal('dispatchEvent', dom.window.dispatchEvent.bind(dom.window));
	vi.spyOn(webStorage, 'StoreAdapterWeb').mockImplementation(() => {
		const __storage = {
			get: t.vi.fn((key: string) => {
				return nativeStorageStub.getItem(key);
			}),
			set: t.vi.fn((key: string, value: string) => {
				return nativeStorageStub.setItem(key, value);
			}),
			delete: t.vi.fn((key: string) => {
				return nativeStorageStub.removeItem(key);
			}),
			platform: 'web' as const,
			get storage() {
				return __storage;
			},
		} as any;
		return __storage;
	});
};
