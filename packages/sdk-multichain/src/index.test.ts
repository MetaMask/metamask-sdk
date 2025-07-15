import * as t from 'vitest';
import { vi } from 'vitest';
import { JSDOM as Page } from 'jsdom';
import { createMetamaskSDK as createMetamaskSDKWeb } from './index.browser';
import { MultichainSDKBaseOptions, MultichainSDKBase } from './domain';
import { MultichainSDK } from './multichain';
import * as loggerModule from './domain/logger';
import * as analyticsModule from '@metamask/sdk-analytics';

type NativeStorageStub = {
  data: Map<string, string>;
  getItem: t.Mock<(key: string) => string | null>;
  setItem: t.Mock<(key: string, value: string) => void>;
  removeItem: t.Mock<(key: string) => void>;
  clear: t.Mock<() => void>;
}

vi.mock('./domain/logger', () => {
  const mockLogger = vi.fn();
  return {
    createLogger: vi.fn(() => mockLogger),
    enableDebug: vi.fn(() => {}),
    isEnabled: vi.fn(() => true),
    __mockLogger: mockLogger,
  }
})
t.vi.mock('@metamask/sdk-analytics');


function createMultiplatformTestCase(
  platform: 'web' | 'node' | 'rn',
  options: MultichainSDKBaseOptions,
  createSDK: (options: MultichainSDKBaseOptions) => Promise<MultichainSDKBase>,
  setupMocks?: (options: NativeStorageStub) => void,
  cleanupMocks?: () => void
) {

  t.describe(`Running createMetamaskSDK in ${platform}`, () => {
    let sdk: MultichainSDKBase;
    let setupAnalyticsSpy: any;
    let initSpy: any;
    let nativeStorageStub: NativeStorageStub;

    t.beforeEach(async () => {
      t.vi.clearAllMocks();
      t.vi.resetModules();

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
      }

      nativeStorageStub.data.set('DEBUG', 'metamask-sdk:*');

      setupMocks?.(nativeStorageStub);

      // Mock analytics methods
      t.vi.mocked(analyticsModule.analytics).setGlobalProperty = t.vi.fn();
      t.vi.mocked(analyticsModule.analytics).enable = t.vi.fn();
      t.vi.mocked(analyticsModule.analytics).track = t.vi.fn();

      setupAnalyticsSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'setupAnalytics');
      initSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'init')
    });

    t.afterEach(() => {
      nativeStorageStub.data.clear()
      cleanupMocks?.();
      t.vi.clearAllMocks();
      t.vi.resetModules();
      t.vi.unstubAllGlobals();
    });

    t.it(`${platform} should call setupAnalytics if analytics is ENABLED and trigger analytics.enable and init evt`, async () => {
      options.analytics.enabled = true;
      sdk = await createSDK(options);
      t.expect(sdk).toBeDefined();
      t.expect(initSpy).toHaveBeenCalled();
      t.expect(setupAnalyticsSpy).toHaveBeenCalled();
      t.expect(analyticsModule.analytics.enable).toHaveBeenCalled();
      t.expect(analyticsModule.analytics.track).toHaveBeenCalledWith('sdk_initialized', {});
    });

    t.it(`${platform} should NOT call analytics.enable if analytics is DISABLED`, async () => {
      options.analytics.enabled = false;
      sdk = await createSDK(options);
      t.expect(sdk).toBeDefined();
      t.expect(initSpy).toHaveBeenCalled();
      t.expect(setupAnalyticsSpy).toHaveBeenCalled();
      t.expect(analyticsModule.analytics.enable).not.toHaveBeenCalled();
      t.expect(analyticsModule.analytics.track).not.toHaveBeenCalled();
    });

    t.it(`${platform} should call init and setupAnalytics with logger configuration`, async () => {
      sdk = await createSDK(options);
      t.expect(sdk).toBeDefined();
      t.expect(initSpy).toHaveBeenCalled();
      t.expect(setupAnalyticsSpy).toHaveBeenCalled();
      t.expect(sdk.isInitialized).toBe(true);
      t.expect(loggerModule.enableDebug).toHaveBeenCalledWith('metamask-sdk:core');
    });

    t.it(`${platform} Should gracefully handle init errors by just logging them and return non initialized sdk`, async () => {
      const testError = new Error('Test error');
      initSpy.mockImplementation(() => {
        throw testError;
      });

      sdk = await createSDK(options);

      t.expect(sdk).toBeDefined();
      t.expect(sdk.isInitialized).toBe(false);

      // Access the mock logger from the module
      const mockLogger = (loggerModule as any).__mockLogger;

      // Verify that the logger was called with the error
      t.expect(mockLogger).toHaveBeenCalledWith(
        'MetaMaskSDK error during initialization',
        testError
      );
    });


  });
}

t.describe('MultichainSDK', () => {
  createMultiplatformTestCase('web', {
    dapp: {
      name: 'Test Dapp',
      url: 'https://test.dapp',
    },
    analytics: {
      enabled: false
    },
    ui: {
      headless: false
    }
  },
    createMetamaskSDKWeb,
    (nativeStorageStub) => {
      const dom = new Page('<!DOCTYPE html><p>Hello world</p>', { url: "https://dapp.io/" });

      t.vi.stubGlobal('navigator', {
        ...dom.window.navigator,
        product: 'Chrome',
      });

      t.vi.stubGlobal('window', {
        ...dom.window,
        location: {
          hostname: 'test.dapp',
        },
        addEventListener: t.vi.fn(),
        removeEventListener: t.vi.fn(),
        localStorage: nativeStorageStub,
      });
    });
});



