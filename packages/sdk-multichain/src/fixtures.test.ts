/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/suspicious/noAsyncPromiseExecutor: ok for tests */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
/**
 * Test fixtures and utilities for the Multichain SDK tests
 * This file is excluded from test discovery via vitest.config.ts
 */
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
// Additional imports for standardized setup functions
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JSDOM as Page } from 'jsdom';
import type { Transport } from '@metamask/multichain-api-client';
import * as t from 'vitest';
import { vi } from 'vitest';
import type { MultiChainFNOptions, MultichainCore, SessionData } from '../src/domain';
import { MultichainSDK } from '../src/multichain';

// Import createSDK functions for convenience
import { createMetamaskSDK as createMetamaskSDKWeb } from './index.browser';
import { createMetamaskSDK as createMetamaskSDKRN } from './index.native';
import { createMetamaskSDK as createMetamaskSDKNode } from './index.node';
import * as nodeStorage from './store/adapters/node';
import * as webStorage from './store/adapters/web';
import type { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';

// Mock logger at the top level
vi.mock('./domain/logger', () => {
	const __mockLogger = vi.fn();
	return {
		createLogger: vi.fn(() => __mockLogger),
		enableDebug: vi.fn(() => {}),
		isEnabled: vi.fn(() => true),
		__mockLogger,
	};
});

// Mock analytics at the top level
vi.mock('@metamask/sdk-analytics', () => ({
	analytics: {
		setGlobalProperty: vi.fn(),
		enable: vi.fn(),
		track: vi.fn(),
	},
}));

// Mock sdk-multichain-ui loader to prevent CJS loading crash
vi.mock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js', () => ({
	defineCustomElements: vi.fn(),
}));

vi.mock('../src/multichain/mwp/index.ts', () => {
	const mwpMock = vi.fn();
	const createSessionRequest = vi.fn(() => {
		return {
			id: '1234',
			expiresAt: new Date(Date.now() + 60 * 1000),
		};
	});
	return {
		MWPTransport: mwpMock,
		createSessionRequest,
		__mockMWPTransport: mwpMock,
		__mockCreateSessionRequest: createSessionRequest,
	};
});

// Mock DappClient with event emitter functionality
vi.mock('@metamask/mobile-wallet-protocol-dapp-client', () => {
	// Create a factory function that returns a new mock instance with event handling
	const createMockDappClient = () => {
		const eventListeners = new Map<string, Array<{ handler: (...args: any[]) => void; once: boolean }>>();

		const mockDappClient = {
			connect: vi.fn(() => {
				mockDappClient.emit('connected');
				return Promise.resolve();
			}),
			disconnect: vi.fn(() => {
				mockDappClient.emit('disconnected');
				return Promise.resolve();
			}),
			sendRequest: vi.fn(),
			resume: vi.fn(),

			// Event handling methods
			once: vi.fn((event: string, handler: (...args: any[]) => void) => {
				if (!eventListeners.has(event)) {
					eventListeners.set(event, []);
				}
				eventListeners.get(event)!.push({ handler, once: true });
			}),

			on: vi.fn((event: string, handler: (...args: any[]) => void) => {
				if (!eventListeners.has(event)) {
					eventListeners.set(event, []);
				}
				eventListeners.get(event)!.push({ handler, once: false });
			}),

			off: vi.fn((event: string, handler?: (...args: any[]) => void) => {
				if (!eventListeners.has(event)) return;

				if (handler) {
					// Remove specific handler
					const listeners = eventListeners.get(event)!;
					const index = listeners.findIndex((listener) => listener.handler === handler);
					if (index !== -1) {
						listeners.splice(index, 1);
					}
				} else {
					// Remove all handlers for this event
					eventListeners.delete(event);
				}
			}),

			// Method to emit events (for testing purposes)
			emit: vi.fn((event: string, ...args: any[]) => {
				if (!eventListeners.has(event)) return;

				const listeners = eventListeners.get(event)!;
				// Create a copy to iterate over, as 'once' handlers will modify the original array
				const listenersToCall = [...listeners];

				listenersToCall.forEach(({ handler, once }) => {
					try {
						handler(...args);
					} catch (error) {
						console.error(`Error in event handler for '${event}':`, error);
					}

					// Remove 'once' handlers after calling them
					if (once) {
						const index = listeners.findIndex((l) => l.handler === handler);
						if (index !== -1) {
							listeners.splice(index, 1);
						}
					}
				});
			}),

			// Helper methods for testing
			getEventListeners: vi.fn((event?: string) => {
				if (event) {
					return eventListeners.get(event) || [];
				}
				return Object.fromEntries(eventListeners);
			}),

			clearEventListeners: vi.fn((event?: string) => {
				if (event) {
					eventListeners.delete(event);
				} else {
					eventListeners.clear();
				}
			}),
		};

		return mockDappClient;
	};

	// Create a shared instance for backward compatibility
	const sharedMockDappClient = createMockDappClient();

	return {
		DappClient: vi.fn().mockImplementation(() => sharedMockDappClient),
		__mockDappClient: sharedMockDappClient,
		__createMockDappClient: createMockDappClient,
	};
});

// Mock WebSocket at the top level
const createMockWebSocket = () => {
	const mockWS = {
		CONNECTING: 0,
		OPEN: 1,
		CLOSING: 2,
		CLOSED: 3,
		readyState: 1,
		url: '',
		protocol: '',
		bufferedAmount: 0,
		extensions: '',
		binaryType: 'blob' as BinaryType,
		onopen: null as ((event: Event) => void) | null,
		onmessage: null as ((event: MessageEvent) => void) | null,
		onerror: null as ((event: Event) => void) | null,
		onclose: null as ((event: CloseEvent) => void) | null,
		send: vi.fn(),
		close: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	};
	return mockWS;
};

vi.mock('ws', () => ({
	default: vi.fn().mockImplementation(() => createMockWebSocket()),
	WebSocket: vi.fn().mockImplementation(() => createMockWebSocket()),
}));

// Mock native WebSocket for browser environments
const mockWebSocketConstructor = vi.fn().mockImplementation(() => createMockWebSocket());
vi.stubGlobal('WebSocket', mockWebSocketConstructor);

// Mock the MWPClientTransport
vi.mock('./multichain/client', () => ({
	MWPClientTransport: {
		connect: vi.fn(() => Promise.resolve()),
		disconnect: vi.fn(() => Promise.resolve()),
		isConnected: vi.fn(() => false),
		request: vi.fn(() => Promise.resolve({})),
		onNotification: vi.fn(() => () => {}),
	},
}));

// Mock multichain client at the top level with factory functions
vi.mock('@metamask/multichain-api-client', () => {
	let currentTransport: Transport | undefined;

	const transport = vi.fn();
	const invokeResponse = vi.fn((req: any) => {
		return currentTransport?.request(req);
	});

	const mockMultichainClient = {
		createSession: vi.fn(),
		getSession: vi.fn(),
		revokeSession: vi.fn(),
		invokeMethod: invokeResponse,
		extendsRpcApi: vi.fn(),
		onNotification: vi.fn(),
	};

	return {
		getMultichainClient: vi.fn(({ transport: transportToMock }) => {
			currentTransport = transportToMock;
			return mockMultichainClient;
		}),
		getDefaultTransport: vi.fn(() => {
			currentTransport = transport();
			return currentTransport;
		}),
		// Export the mocks so tests can access them
		__mockMultichainClient: mockMultichainClient,
		__mockTransport: transport,
	};
});

type GetItem = (key: string) => string | null;
type SetItem = (key: string, value: string) => void;
type RemoveItem = (key: string) => void;
type Clear = () => void;

export type NativeStorageStub = {
	data: Map<string, string>;
	getItem: t.Mock<GetItem>;
	setItem: t.Mock<SetItem>;
	removeItem: t.Mock<RemoveItem>;
	clear: t.Mock<Clear>;
};

export type MockedData = {
	initSpy: t.MockInstance<MultichainSDK['init']>;
	setupAnalyticsSpy: t.MockInstance<MultichainSDK['setupAnalytics']>;
	emitSpy: t.MockInstance<MultichainSDK['emit']>;
	showInstallModalSpy: t.MockInstance<any>;
	nativeStorageStub: NativeStorageStub;
	mockTransport: t.Mocked<Transport & { __triggerNotification: (data: any) => void }>;
	mockMultichainClient: any;
	mockWebSocket: any;
	mockDappClient: t.Mocked<DappClient>;
	mockLogger: t.MockInstance<debug.Debugger>;
};

export type TestSuiteOptions<T extends MultiChainFNOptions> = {
	platform: string;
	createSDK: Options<T>['createSDK'];
	options: Options<T>['options'];
	beforeEach: () => Promise<MockedData>;
	afterEach: (mocks: MockedData) => Promise<void>;
	storage: NativeStorageStub;
};

export type Options<T extends MultiChainFNOptions> = {
	platform: 'web' | 'node' | 'rn';
	options: T;
	createSDK: (options: T) => Promise<MultichainCore>;
	setupMocks?: (options: NativeStorageStub) => void;
	cleanupMocks?: () => void;
	tests: (options: TestSuiteOptions<T>) => void;
};

export type CreateTestFN = <T extends MultiChainFNOptions>(options: Options<T>) => void;

// Mock session data for testing
export const mockSessionData: SessionData = {
	sessionScopes: {
		'eip155:1': {
			methods: [],
			notifications: [],
			accounts: ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'],
		},
	},
	expiry: new Date(Date.now() + 3600000).toISOString(),
};

// Standardized setup functions for each platform
export const setupNodeMocks = (nativeStorageStub: NativeStorageStub) => {
	// Mock console.log to prevent QR codes from displaying in test output
	t.vi.spyOn(console, 'log').mockImplementation(() => {});
	t.vi.spyOn(console, 'clear').mockImplementation(() => {});

	t.vi.spyOn(nodeStorage, 'StoreAdapterNode').mockImplementation(() => {
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

export const setupRNMocks = (nativeStorageStub: NativeStorageStub) => {
	// Mock console.log to prevent QR codes from displaying in test output (for consistency)
	t.vi.spyOn(console, 'log').mockImplementation(() => {});
	t.vi.spyOn(console, 'clear').mockImplementation(() => {});

	t.vi.spyOn(AsyncStorage, 'getItem').mockImplementation(async (key) => nativeStorageStub.getItem(key));
	t.vi.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => nativeStorageStub.setItem(key, value));
	t.vi.spyOn(AsyncStorage, 'removeItem').mockImplementation(async (key) => nativeStorageStub.removeItem(key));
};

export const setupWebMocks = (nativeStorageStub: NativeStorageStub, dappUrl = 'https://test.dapp') => {
	const factory = new IDBFactory();
	const dom = new Page('<!DOCTYPE html><p>Hello world</p>', {
		url: dappUrl,
	});
	const globalStub = {
		...dom.window,
		addEventListener: t.vi.fn(),
		removeEventListener: t.vi.fn(),
		indexedDB: factory,
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

// Helper functions to create standardized test configurations
export const runTestsInNodeEnv = <T extends MultiChainFNOptions>(options: T, testSuite: (options: TestSuiteOptions<T>) => void) => {
	return createTest({
		platform: 'node',
		createSDK: createMetamaskSDKNode,
		options,
		setupMocks: setupNodeMocks,
		tests: testSuite,
	});
};

export const runTestsInRNEnv = <T extends MultiChainFNOptions>(options: T, testSuite: (options: TestSuiteOptions<T>) => void) => {
	return createTest({
		platform: 'rn',
		createSDK: createMetamaskSDKRN,
		options,
		setupMocks: setupRNMocks,
		tests: testSuite,
	});
};

export const runTestsInWebEnv = <T extends MultiChainFNOptions>(options: T, testSuite: (options: TestSuiteOptions<T>) => void, dappUrl?: string) => {
	return createTest({
		platform: 'web',
		createSDK: createMetamaskSDKWeb,
		options,
		setupMocks: (nativeStorageStub) => setupWebMocks(nativeStorageStub, dappUrl),
		tests: testSuite,
	});
};

export const createTest: CreateTestFN = ({ platform, options, createSDK, setupMocks, cleanupMocks, tests }) => {
	let nativeStorageStub!: NativeStorageStub;
	let setupAnalyticsSpy!: t.MockInstance<MultichainSDK['setupAnalytics']>;
	let initSpy!: t.MockInstance<MultichainSDK['init']>;
	let emitSpy!: t.MockInstance<MultichainSDK['emit']>;
	let showInstallModalSpy!: t.MockInstance<any>;
	let dappClientMock!: t.Mocked<DappClient>;
	let mockLogger!: t.MockInstance<debug.Debugger>;

	async function beforeEach() {
		const mockMultichainClient = ((await import('@metamask/multichain-api-client')) as any).__mockMultichainClient;
		const mwpTransportMock = ((await import('./multichain/mwp/index.ts')) as any).__mockMWPTransport;
		const defaultTransportMock = ((await import('@metamask/multichain-api-client')) as any).__mockTransport;

		mockLogger = ((await import('./domain/logger')) as any).__mockLogger;
		dappClientMock = ((await import('@metamask/mobile-wallet-protocol-dapp-client')) as any).__mockDappClient;

		const initialTransportSpy = {
			initialTransport: true,

			connect: vi.fn(() => {
				initialTransportSpy.__isConnected = true;
			}),
			disconnect: vi.fn(() => {
				initialTransportSpy.__isConnected = false;
			}),
			isConnected: vi.fn(() => {
				return initialTransportSpy.__isConnected;
			}),
			request: vi.fn(),
			onNotification: vi.fn((callback: (data: any) => void) => {
				initialTransportSpy.__notificationCallback = callback;
				return () => {
					initialTransportSpy.__notificationCallback = null;
				};
			}),

			__isConnected: false,
			__notificationCallback: null as ((data: any) => void) | null,
			__triggerNotification: vi.fn((data: any) => {
				if (initialTransportSpy.__notificationCallback) {
					initialTransportSpy.__notificationCallback(data);
				}
			}),
		};

		defaultTransportMock.mockImplementation(() => initialTransportSpy);

		mwpTransportMock.mockImplementation(() => initialTransportSpy);

		// Clear all mocks first
		t.vi.clearAllMocks();

		// Reset multichain client mocks with default implementations
		mockMultichainClient.createSession.mockResolvedValue(mockSessionData);
		mockMultichainClient.getSession.mockResolvedValue(mockSessionData);

		// Create storage stub using the mocked class
		nativeStorageStub = {
			data: new Map<string, string>(),
			getItem: t.vi.fn((key: string) => nativeStorageStub.data.get(key) || null),
			setItem: t.vi.fn((key: string, value: string) => {
				nativeStorageStub.data.set(key, value);
			}),
			removeItem: t.vi.fn((key: string) => {
				nativeStorageStub.data.delete(key);
			}),
			clear: t.vi.fn(() => {
				nativeStorageStub.data.clear();
			}),
		};

		// Set debug flag
		nativeStorageStub.data.set('DEBUG', 'metamask-sdk:*');

		// Create spies for SDK methods
		initSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'init');
		setupAnalyticsSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'setupAnalytics');
		emitSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'emit');
		showInstallModalSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'showInstallModal');

		// Setup platform-specific mocks
		setupMocks?.(nativeStorageStub);

		return {
			initSpy,
			setupAnalyticsSpy,
			emitSpy,
			showInstallModalSpy,
			nativeStorageStub,
			mockTransport: initialTransportSpy as any,
			mockMultichainClient,
			mockWebSocket: mockWebSocketConstructor,
			mockDappClient: dappClientMock,
			mockLogger,
		};
	}

	async function afterEach(mocks: MockedData) {
		// Clear storage
		mocks.nativeStorageStub.data.clear();

		// Restore spies
		mocks.setupAnalyticsSpy?.mockRestore();
		mocks.initSpy?.mockRestore();
		mocks.emitSpy?.mockRestore();
		mocks.showInstallModalSpy?.mockRestore();

		// Clear all mocks
		t.vi.clearAllMocks();

		// Run custom cleanup
		cleanupMocks?.();
	}

	tests({
		platform,
		createSDK,
		options,
		beforeEach,
		afterEach,
		storage: nativeStorageStub,
	});
};
