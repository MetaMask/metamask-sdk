/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable default-case */
/* eslint-disable jest/no-export */
import { PlatformType } from '@metamask/sdk-communication-layer';
// @ts-ignore
import Bowser from 'bowser';
import { getPlatformType } from '../services/PlatfformManager/getPlatformType';
import { isMetaMaskInstalled } from '../services/PlatfformManager/isMetaMaskInstalled';
import { openDeeplink } from '../services/PlatfformManager/openDeeplink';
import { PlatformManager } from './PlatfformManager';

jest.mock('../services/PlatfformManager/getPlatformType');
jest.mock('../services/PlatfformManager/isMetaMaskInstalled');
jest.mock('../services/PlatfformManager/openDeeplink');

describe('PlatformManager', () => {
  let platformManager: PlatformManager;
  const originalNavigator = Object.getOwnPropertyDescriptor(
    global,
    'navigator',
  );
  const originalWindow = Object.getOwnPropertyDescriptor(global, 'window');

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
      debug: false,
    });
  });

  afterEach(() => {
    // Restore original properties after each test
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', originalNavigator);
    } else {
      // @ts-expect-error - Deleting property for cleanup
      delete global.navigator;
    }

    if (originalWindow) {
      Object.defineProperty(global, 'window', originalWindow);
    } else {
      // @ts-expect-error - Deleting property for cleanup
      delete global.window;
    }
  });

  describe('constructor', () => {
    it('should initialize correctly with default parameters', () => {
      platformManager = new PlatformManager({
        useDeepLink: false,
      });

      expect(platformManager).toBeDefined();
      expect(platformManager.state.useDeeplink).toBe(false);
      expect(platformManager.state.debug).toBe(false);
    });

    it('should initialize correctly with custom parameters', () => {
      platformManager = new PlatformManager({
        useDeepLink: true,
        debug: true,
      });

      expect(platformManager).toBeDefined();
      expect(platformManager.state.useDeeplink).toBe(true);
      expect(platformManager.state.debug).toBe(true);
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
      Object.defineProperty(global, 'navigator', {
        value: { product: 'ReactNative' },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'window', {
        value: { navigator: { product: 'ReactNative' } },
        writable: true,
        configurable: true,
      });

      expect(platformManager.isReactNative()).toBe(true);
    });

    it('should return false if the environment is not React Native', () => {
      Object.defineProperty(global, 'navigator', {
        value: { product: 'Gecko' },
        writable: true,
        configurable: true,
      });

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
      // Ensure window and navigator exist for Bowser/platform checks if needed by underlying logic
      Object.defineProperty(global, 'window', {
        value: { navigator: { userAgent: 'Test Desktop Agent' } },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Test Desktop Agent', product: 'Gecko' }, // Mock non-RN navigator
        writable: true,
        configurable: true,
      });

      // Mock dependencies of isDesktopWeb if necessary
      // Assuming isDesktopWeb = !isNotBrowser && !isMobileWeb
      jest.spyOn(platformManager, 'isNotBrowser').mockReturnValue(false);
      jest.spyOn(platformManager, 'isMobileWeb').mockReturnValue(false);
      // Also mock isMobile if isDesktopWeb depends on it
      jest.spyOn(platformManager, 'isMobile').mockReturnValue(false);

      expect(platformManager.isDesktopWeb()).toBe(true);
    });

    it('should return false if environment is not a desktop web browser', () => {
      // Ensure window and navigator exist
      Object.defineProperty(global, 'window', {
        value: { navigator: { userAgent: 'Test Mobile Agent' } },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Test Mobile Agent', product: 'Gecko' }, // Mock non-RN navigator
        writable: true,
        configurable: true,
      });

      jest.spyOn(platformManager, 'isNotBrowser').mockReturnValue(false); // It is a browser
      jest.spyOn(platformManager, 'isMobileWeb').mockReturnValue(true); // It is mobile web
      // Also mock isMobile if isDesktopWeb depends on it
      jest.spyOn(platformManager, 'isMobile').mockReturnValue(true);

      expect(platformManager.isDesktopWeb()).toBe(false);
    });
  });

  describe('isMobile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Need to define window/navigator here as well for Bowser
      Object.defineProperty(global, 'window', {
        value: { navigator: { userAgent: 'some-user-agent' } },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'some-user-agent' },
        writable: true,
        configurable: true,
      });

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
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(platformManager.isMetaMaskMobileWebView()).toBe(false);
    });

    it('should return true if window.ReactNativeWebView exists and userAgent ends with MetaMaskMobile', () => {
      Object.defineProperty(global, 'window', {
        value: { ReactNativeWebView: {} },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'someStringMetaMaskMobile' },
        writable: true,
        configurable: true,
      });

      expect(platformManager.isMetaMaskMobileWebView()).toBe(true);
    });

    it('should return false if window.ReactNativeWebView does not exist', () => {
      Object.defineProperty(global, 'window', {
        value: {}, // Missing ReactNativeWebView
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'someStringMetaMaskMobile' },
        writable: true,
        configurable: true,
      });

      expect(platformManager.isMetaMaskMobileWebView()).toBe(false);
    });

    it('should return false if userAgent does not end with MetaMaskMobile', () => {
      Object.defineProperty(global, 'window', {
        value: { ReactNativeWebView: {} },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'someString' }, // Doesn't end with MetaMaskMobile
        writable: true,
        configurable: true,
      });

      expect(platformManager.isMetaMaskMobileWebView()).toBe(false);
    });

    it('should return false if neither condition is met', () => {
      Object.defineProperty(global, 'window', {
        value: {}, // Missing ReactNativeWebView
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'someString' }, // Doesn't end with MetaMaskMobile
        writable: true,
        configurable: true,
      });

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
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(PlatformManager.isNotBrowser()).toBe(true);
    });

    it('should return true when window.navigator is undefined', () => {
      Object.defineProperty(global, 'window', {
        value: {}, // No navigator property
        writable: true,
        configurable: true,
      });

      expect(PlatformManager.isNotBrowser()).toBe(true);
    });

    it('should return true when global.navigator.product is ReactNative', () => {
      Object.defineProperty(global, 'navigator', {
        value: { product: 'ReactNative' },
        writable: true,
        configurable: true,
      });

      // Ensure window exists but doesn't interfere
      Object.defineProperty(global, 'window', {
        value: { navigator: { product: 'Gecko' } }, // Different product on window.navigator
        writable: true,
        configurable: true,
      });

      expect(PlatformManager.isNotBrowser()).toBe(true);
    });

    it('should return true when navigator.product is ReactNative', () => {
      // Ensure global.navigator doesn't interfere
      Object.defineProperty(global, 'navigator', {
        value: { product: 'Gecko' }, // Different product on global.navigator
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'window', {
        value: { navigator: { product: 'ReactNative' } },
        writable: true,
        configurable: true,
      });

      expect(PlatformManager.isNotBrowser()).toBe(true);
    });

    it('should return false otherwise', () => {
      Object.defineProperty(global, 'window', {
        value: { navigator: { product: 'Gecko' } }, // Regular browser
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'navigator', {
        value: { product: 'Gecko' }, // Regular browser
        writable: true,
        configurable: true,
      });

      expect(PlatformManager.isNotBrowser()).toBe(false);
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

    // Note: This test now needs to mock the *static* isNotBrowser method
    it('should return true if PlatformManager.isNotBrowser returns false', () => {
      // Need to ensure navigator/window are defined for the static method to potentially use them
      Object.defineProperty(global, 'window', {
        value: { navigator: { product: 'Gecko' } },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'navigator', {
        value: { product: 'Gecko' },
        writable: true,
        configurable: true,
      });
      jest.spyOn(PlatformManager, 'isNotBrowser').mockReturnValue(false);
      expect(platformManager.isBrowser()).toBe(true);
    });

    it('should return false if PlatformManager.isNotBrowser returns true', () => {
      // Ensure window/navigator are set up for a non-browser scenario if needed
      Object.defineProperty(global, 'window', {
        value: undefined, // Example non-browser scenario
        writable: true,
        configurable: true,
      });
      // global.navigator might also need setting depending on isNotBrowser logic
      jest.spyOn(PlatformManager, 'isNotBrowser').mockReturnValue(true);
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
