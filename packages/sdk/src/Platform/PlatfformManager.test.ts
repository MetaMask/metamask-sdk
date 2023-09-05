/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable default-case */
/* eslint-disable jest/no-export */
import { PlatformType } from '@metamask/sdk-communication-layer';
// @ts-ignore
import Bowser from 'bowser';
import { disableWakeLock } from '../services/PlatfformManager/disableWakeLock';
import { enableWakeLock } from '../services/PlatfformManager/enableWakeLock';
import { getPlatformType } from '../services/PlatfformManager/getPlatformType';
import { isMetaMaskInstalled } from '../services/PlatfformManager/isMetaMaskInstalled';
import { openDeeplink } from '../services/PlatfformManager/openDeeplink';
import { WakeLockStatus } from '../types/WakeLockStatus';
import { PlatformManager } from './PlatfformManager';
import { WakeLockManager } from './WakeLockManager';

jest.mock('../services/PlatfformManager/enableWakeLock');
jest.mock('../services/PlatfformManager/disableWakeLock');
jest.mock('../services/PlatfformManager/getPlatformType');
jest.mock('../services/PlatfformManager/isMetaMaskInstalled');
jest.mock('../services/PlatfformManager/openDeeplink');

describe('PlatformManager', () => {
  let platformManager: PlatformManager;

  const mockEnableWakeLock = enableWakeLock as jest.MockedFunction<
    typeof enableWakeLock
  >;

  const mockDisableWakeLock = disableWakeLock as jest.MockedFunction<
    typeof disableWakeLock
  >;

  const mockGetPlatformType = getPlatformType as jest.MockedFunction<
    typeof getPlatformType
  >;

  const mockIsMetaMaskInstalled = isMetaMaskInstalled as jest.MockedFunction<
    typeof isMetaMaskInstalled
  >;

  const mockOpenDeeplink = openDeeplink as jest.MockedFunction<
    typeof openDeeplink
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    platformManager = new PlatformManager({
      useDeepLink: false,
      preferredOpenLink: undefined,
      wakeLockStatus: undefined,
      debug: false,
    });
  });

  describe('constructor', () => {
    it('should initialize correctly with default parameters', () => {
      platformManager = new PlatformManager({
        useDeepLink: false,
      });

      expect(platformManager).toBeDefined();
      expect(platformManager.state.useDeeplink).toBe(false);
      expect(platformManager.state.wakeLockStatus).toBe(
        WakeLockStatus.Temporary,
      );
      expect(platformManager.state.debug).toBe(false);
      expect(platformManager.state.wakeLock).toBeInstanceOf(WakeLockManager);
    });

    it('should initialize correctly with custom parameters', () => {
      platformManager = new PlatformManager({
        useDeepLink: true,
        wakeLockStatus: WakeLockStatus.UntilResponse,
        debug: true,
      });

      expect(platformManager).toBeDefined();
      expect(platformManager.state.useDeeplink).toBe(true);
      expect(platformManager.state.wakeLockStatus).toBe(
        WakeLockStatus.UntilResponse,
      );
      expect(platformManager.state.debug).toBe(true);
    });
  });

  describe('enableWakeLock', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should call enableWakeLock from enableWakeLockService', async () => {
      mockEnableWakeLock.mockReturnValue(undefined);

      platformManager.enableWakeLock();

      expect(mockEnableWakeLock).toHaveBeenCalledWith(platformManager);
    });
  });

  describe('disableWakeLock', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should call disableWakeLock from disableWakeLockService', async () => {
      mockDisableWakeLock.mockReturnValue(undefined);

      platformManager.disableWakeLock();

      expect(mockDisableWakeLock).toHaveBeenCalledWith(platformManager);
    });
  });

  describe('openDeeplink', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should call openDeeplink from openDeeplinkService with the correct arguments', async () => {
      mockOpenDeeplink.mockReturnValue(undefined);

      const universalLink = 'https://some-universal-link';
      const deeplink = 'some-deeplink';
      const target = '_blank';

      platformManager.openDeeplink(universalLink, deeplink, target);

      expect(mockOpenDeeplink).toHaveBeenCalledWith(
        platformManager,
        universalLink,
        deeplink,
        target,
      );
    });
  });

  describe('isReactNative', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should return true if the environment is React Native', () => {
      global.navigator = {
        product: 'ReactNative',
      } as any;

      global.window = {
        navigator: {
          product: 'ReactNative',
        },
      } as any;

      expect(platformManager.isReactNative()).toBe(true);
    });

    it('should return false if the environment is not React Native', () => {
      global.navigator = {
        product: 'Gecko',
      } as any;

      expect(platformManager.isReactNative()).toBe(false);
    });
  });

  describe('isMetaMaskInstalled', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should return true if MetaMask is installed', () => {
      mockIsMetaMaskInstalled.mockReturnValue(true);

      expect(platformManager.isMetaMaskInstalled()).toBe(true);
    });

    it('should return false if MetaMask is not installed', () => {
      mockIsMetaMaskInstalled.mockReturnValue(false);

      expect(platformManager.isMetaMaskInstalled()).toBe(false);
    });
  });

  describe('isDesktopWeb', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should return true if environment is a desktop web browser', () => {
      jest
        .spyOn(platformManager, 'isNotBrowser')
        .mockImplementation()
        .mockReturnValue(false);

      jest
        .spyOn(platformManager, 'isMobileWeb')
        .mockImplementation()
        .mockReturnValue(false);

      expect(platformManager.isDesktopWeb()).toBe(true);
    });

    it('should return false if environment is not a desktop web browser', () => {
      jest
        .spyOn(platformManager, 'isNotBrowser')
        .mockImplementation()
        .mockReturnValue(false);

      jest
        .spyOn(platformManager, 'isMobileWeb')
        .mockImplementation()
        .mockReturnValue(true);

      expect(platformManager.isDesktopWeb()).toBe(false);
    });
  });

  describe('isMobile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      global.window = {
        navigator: {
          userAgent: 'some-user-agent',
        },
      } as any;

      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should return true if platform type is mobile', () => {
      const mockBrowserInfo = {
        platform: { type: 'mobile' },
      } as any;

      jest.spyOn(Bowser, 'parse').mockReturnValue(mockBrowserInfo);

      expect(platformManager.isMobile()).toBe(true);
    });

    it('should return true if platform type is tablet', () => {
      const mockBrowserInfo = {
        platform: { type: 'tablet' },
      } as any;

      jest.spyOn(Bowser, 'parse').mockReturnValue(mockBrowserInfo);

      expect(platformManager.isMobile()).toBe(true);
    });

    it('should return false if platform type is not mobile or tablet', () => {
      const mockBrowserInfo = {
        platform: { type: 'desktop' },
      } as any;

      jest.spyOn(Bowser, 'parse').mockReturnValue(mockBrowserInfo);

      expect(platformManager.isMobile()).toBe(false);
    });

    it('should return false if platform type is undefined', () => {
      const mockBrowserInfo = {
        platform: { type: undefined },
      } as any;

      jest.spyOn(Bowser, 'parse').mockReturnValue(mockBrowserInfo);

      expect(platformManager.isMobile()).toBe(false);
    });
  });

  describe('isSecure', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should return true if isReactNative returns true', () => {
      jest.spyOn(platformManager, 'isReactNative').mockReturnValue(true);
      jest.spyOn(platformManager, 'isMobileWeb').mockReturnValue(false);

      expect(platformManager.isSecure()).toBe(true);
    });

    it('should return true if isMobileWeb returns true', () => {
      jest.spyOn(platformManager, 'isReactNative').mockReturnValue(false);
      jest.spyOn(platformManager, 'isMobileWeb').mockReturnValue(true);

      expect(platformManager.isSecure()).toBe(true);
    });

    it('should return true if both isReactNative and isMobileWeb return true', () => {
      jest.spyOn(platformManager, 'isReactNative').mockReturnValue(true);
      jest.spyOn(platformManager, 'isMobileWeb').mockReturnValue(true);

      expect(platformManager.isSecure()).toBe(true);
    });

    it('should return false if both isReactNative and isMobileWeb return false', () => {
      jest.spyOn(platformManager, 'isReactNative').mockReturnValue(false);
      jest.spyOn(platformManager, 'isMobileWeb').mockReturnValue(false);

      expect(platformManager.isSecure()).toBe(false);
    });
  });

  describe('isMetaMaskMobileWebView', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should return false if window is undefined', () => {
      global.window = undefined as any;
      expect(platformManager.isMetaMaskMobileWebView()).toBe(false);
    });

    it('should return true if window.ReactNativeWebView exists and userAgent ends with MetaMaskMobile', () => {
      global.window = { ReactNativeWebView: {} } as any;
      global.navigator = { userAgent: 'someStringMetaMaskMobile' } as any;
      expect(platformManager.isMetaMaskMobileWebView()).toBe(true);
    });

    it('should return false if window.ReactNativeWebView does not exist', () => {
      global.window = {} as any;
      global.navigator = { userAgent: 'someStringMetaMaskMobile' } as any;
      expect(platformManager.isMetaMaskMobileWebView()).toBe(false);
    });

    it('should return false if userAgent does not end with MetaMaskMobile', () => {
      global.window = { ReactNativeWebView: {} } as any;
      global.navigator = { userAgent: 'someString' } as any;
      expect(platformManager.isMetaMaskMobileWebView()).toBe(false);
    });

    it('should return false if neither condition is met', () => {
      global.window = {} as any;
      global.navigator = { userAgent: 'someString' } as any;
      expect(platformManager.isMetaMaskMobileWebView()).toBe(false);
    });
  });

  describe('isMobileWeb', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should return true if platformType is MobileWeb', () => {
      platformManager.state = {
        platformType: PlatformType.MobileWeb,
      } as any;

      expect(platformManager.isMobileWeb()).toBe(true);
    });

    it('should return false if platformType is not MobileWeb', () => {
      platformManager.state = {
        platformType: PlatformType.DesktopWeb,
      } as any;
      expect(platformManager.isMobileWeb()).toBe(false);
    });
  });

  describe('isNotBrowser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should return true when window is undefined', () => {
      global.window = undefined as any;

      expect(platformManager.isNotBrowser()).toBe(true);
    });

    it('should return true when window.navigator is undefined', () => {
      global.window = {} as any;

      expect(platformManager.isNotBrowser()).toBe(true);
    });

    it('should return true when global.navigator.product is ReactNative', () => {
      global.navigator = { product: 'ReactNative' } as any;

      expect(platformManager.isNotBrowser()).toBe(true);
    });

    it('should return true when navigator.product is ReactNative', () => {
      global.window = {} as any;
      global.window.navigator = { product: 'ReactNative' } as any;

      expect(platformManager.isNotBrowser()).toBe(true);
    });

    it('should return false otherwise', () => {
      global.window = { navigator: {} } as any;
      global.navigator = {} as any;

      expect(platformManager.isNotBrowser()).toBe(false);
    });
  });

  describe('isNodeJS', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should return true if isNotBrowser is true and isReactNative is false', () => {
      jest.spyOn(platformManager, 'isNotBrowser').mockReturnValue(true);
      jest.spyOn(platformManager, 'isReactNative').mockReturnValue(false);

      expect(platformManager.isNodeJS()).toBe(true);
    });

    it('should return false otherwise', () => {
      jest.spyOn(platformManager, 'isNotBrowser').mockReturnValue(false);
      jest.spyOn(platformManager, 'isReactNative').mockReturnValue(false);

      expect(platformManager.isNodeJS()).toBe(false);
    });
  });

  describe('isBrowser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      platformManager = new PlatformManager({
        useDeepLink: false,
      });
    });

    it('should return true if isNotBrowser returns false', () => {
      jest.spyOn(platformManager, 'isNotBrowser').mockReturnValue(false);

      expect(platformManager.isBrowser()).toBe(true);
    });

    it('should return false if isNotBrowser returns true', () => {
      jest.spyOn(platformManager, 'isNotBrowser').mockReturnValue(true);

      expect(platformManager.isBrowser()).toBe(false);
    });
  });

  describe('isUseDeepLink', () => {
    it('should return the current value of this.state.useDeeplink', () => {
      platformManager = new PlatformManager({
        useDeepLink: true,
      });

      expect(platformManager.isUseDeepLink()).toBe(true);
    });
  });

  describe('getPlatformType', () => {
    it('should call getPlatformType from services and return its result', () => {
      platformManager = new PlatformManager({
        useDeepLink: true,
      });

      const mockResult = 'some-platform-type' as any;

      mockGetPlatformType.mockReturnValue(mockResult);

      const result = platformManager.getPlatformType();

      expect(mockGetPlatformType).toHaveBeenCalledWith(platformManager);
      expect(result).toBe(mockResult);
    });
  });
});
