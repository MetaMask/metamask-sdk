/** @biome-ignore lint/suspicious/noExplicitAny: testing requires this  */
/**
 * Test fixtures and utilities for the Multichain SDK tests
 * This file is excluded from test discovery via vitest.config.ts
 */
import * as t from 'vitest';
import { vi } from 'vitest';

import { MultichainSDK } from '../src/multichain';
import type { MultichainCore, MultiChainFNOptions, SessionData } from '../src/domain';
import type { Transport } from '@metamask/multichain-api-client';

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
// Mock multichain client at the top level with factory functions
vi.mock('@metamask/multichain-api-client', () => {
  const invokeResponse = vi.fn();
  const mockMultichainClient = {
    createSession: vi.fn(),
    getSession: vi.fn(),
    revokeSession: vi.fn(),
    invokeMethod: invokeResponse,
    extendsRpcApi: vi.fn(),
    onNotification: vi.fn(),
  };
  return {
    getMultichainClient: vi.fn(() => mockMultichainClient),
    // Export the mocks so tests can access them
    __mockMultichainClient: mockMultichainClient,
    __mockInvokeResponse: invokeResponse,
  };
});

export type NativeStorageStub = {
  platform: 'web' | 'rn' | 'node';
  data: Map<string, string>;
  getItem: t.Mock<(key: string) => Promise<string | null>>;
  setItem: t.Mock<(key: string, value: string) => Promise<void>>;
  deleteItem: t.Mock<(key: string) => Promise<void>>;
  clear: t.Mock<() => void>;
};

export type MockedData = {
  initSpy: t.MockInstance<MultichainSDK['init']>;
  setupAnalyticsSpy: t.MockInstance<MultichainSDK['setupAnalytics']>;
  emitSpy: t.MockInstance<MultichainSDK['emit']>;
  nativeStorageStub: NativeStorageStub;
  mockTransport: t.Mocked<Transport>;
  mockMultichainClient: any;
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

export const createTest: CreateTestFN = ({ platform, options, createSDK, setupMocks, cleanupMocks, tests }) => {
  let nativeStorageStub!: NativeStorageStub;
  let setupAnalyticsSpy!: t.MockInstance<MultichainSDK['setupAnalytics']>;
  let initSpy!: t.MockInstance<MultichainSDK['init']>;
  let emitSpy!: t.MockInstance<MultichainSDK['emit']>;

  const initialTransportSpy = {
    _isConnected: false,
    connect: vi.fn(() => {
      initialTransportSpy._isConnected = true;
    }),
    disconnect: vi.fn(() => {
      initialTransportSpy._isConnected = false;
    }),
    isConnected: vi.fn(() => initialTransportSpy._isConnected),
    request: vi.fn(),
    onNotification: vi.fn(() => {
      return () => {};
    }),
  };

  // Helper function to reset transport state
  const resetTransportSpy = () => {
    initialTransportSpy._isConnected = false;
    initialTransportSpy.connect.mockClear();
    initialTransportSpy.disconnect.mockClear();
    initialTransportSpy.isConnected.mockClear();
    initialTransportSpy.request.mockClear();
    initialTransportSpy.onNotification.mockClear();
  };

  async function beforeEach() {
    // Clear all mocks first
    t.vi.clearAllMocks();

    // Reset transport spy state
    resetTransportSpy();

    // Reset global SDK state
    MultichainSDK.resetGlobals();

    // Get mocks from the module mock
    const multichainModule = await import('@metamask/multichain-api-client');
    const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

    // Reset multichain client mocks with default implementations
    mockMultichainClient.createSession.mockResolvedValue(mockSessionData);
    mockMultichainClient.getSession.mockResolvedValue(mockSessionData);

    // Create storage stub
    nativeStorageStub = {
      platform,
      data: new Map<string, string>(),
      getItem: vi.fn((key: string) => Promise.resolve(nativeStorageStub.data.get(key) || null)),
      setItem: vi.fn((key: string, value: string) => {
        nativeStorageStub.data.set(key, value);
      }),
      deleteItem: vi.fn((key: string) => {
        nativeStorageStub.data.delete(key);
      }),
      clear: vi.fn(() => {
        nativeStorageStub.data.clear();
      }),
    };

    // Set debug flag
    nativeStorageStub.data.set('DEBUG', 'metamask-sdk:*');

    // Create spies for SDK methods
    initSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'init');
    setupAnalyticsSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'setupAnalytics');
    emitSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'emit');
    t.vi.spyOn(MultichainSDK.prototype as any, 'initialTransport').mockResolvedValue(initialTransportSpy);
    t.vi.spyOn(MultichainSDK.prototype as any, 'getTransportForPlatformType').mockReturnValue(initialTransportSpy);
    // Setup platform-specific mocks
    setupMocks?.(nativeStorageStub);

    return {
      initSpy,
      setupAnalyticsSpy,
      emitSpy,
      nativeStorageStub,
      mockTransport: initialTransportSpy as any,
      mockMultichainClient,
    };
  }

  async function afterEach(mocks: MockedData) {
    // Clear storage
    mocks.nativeStorageStub.data.clear();

    // Restore spies
    mocks.setupAnalyticsSpy?.mockRestore();
    mocks.initSpy?.mockRestore();
    mocks.emitSpy?.mockRestore();

    // Reset transport spy state
    resetTransportSpy();

    // Reset global SDK state
    MultichainSDK.resetGlobals();

    // Reset multichain client mock functions
    if (mocks.mockMultichainClient) {
      mocks.mockMultichainClient.createSession.mockClear();
      mocks.mockMultichainClient.getSession.mockClear();
      mocks.mockMultichainClient.revokeSession.mockClear();
      mocks.mockMultichainClient.invokeMethod.mockClear();
      mocks.mockMultichainClient.onNotification.mockClear();
    }

    // Clear all mocks
    t.vi.clearAllMocks();
    t.vi.resetAllMocks();

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
