import { PlatformType } from '@metamask/sdk-communication-layer';
import Bowser from 'bowser';
import { getPlatformType } from '../services/PlatfformManager/getPlatformType';
import { isMetaMaskInstalled } from '../services/PlatfformManager/isMetaMaskInstalled';
import { openDeeplink } from '../services/PlatfformManager/openDeeplink';

export const TEMPORARY_WAKE_LOCK_TIME = 2000;
export const UNTIL_RESPONSE_WAKE_LOCK_TIME = 40000;

interface PlatformProps {
  useDeepLink: boolean;
  preferredOpenLink?: (link: string, target?: string) => void;
  debug?: boolean;
}

interface PlatformManagerState {
  platformType?: PlatformType;
  useDeeplink: boolean;
  preferredOpenLink?: (link: string, target?: string) => void;
  debug: boolean;
}

export class PlatformManager {
  public state: PlatformManagerState = {
    platformType: undefined,
    useDeeplink: false,
    preferredOpenLink: undefined,
    debug: false,
  };

  constructor({
    useDeepLink,
    preferredOpenLink,
    debug = false,
  }: PlatformProps) {
    this.state.platformType = this.getPlatformType();
    this.state.useDeeplink = useDeepLink;
    this.state.preferredOpenLink = preferredOpenLink;
    this.state.debug = debug;
  }

  openDeeplink(universalLink: string, deeplink: string, target?: string) {
    return openDeeplink(this, universalLink, deeplink, target);
  }

  isReactNative() {
    // Avoid grouping in single condition for readibility
    return (
      this.isNotBrowser() &&
      typeof window !== 'undefined' &&
      window?.navigator &&
      window.navigator?.product === 'ReactNative'
    );
  }

  isMetaMaskInstalled() {
    return isMetaMaskInstalled();
  }

  isDesktopWeb() {
    return this.isBrowser() && !this.isMobileWeb();
  }

  isMobile() {
    const browser = Bowser.parse(window.navigator.userAgent);

    return (
      browser?.platform?.type === 'mobile' ||
      browser?.platform?.type === 'tablet'
    );
  }

  isSecure() {
    return this.isReactNative() || this.isMobileWeb();
  }

  isMetaMaskMobileWebView() {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      Boolean(window.ReactNativeWebView) &&
      Boolean(navigator.userAgent.endsWith('MetaMaskMobile'))
    );
  }

  isMobileWeb() {
    return this.state.platformType === PlatformType.MobileWeb;
  }

  static isNotBrowser() {
    // Check if window or window.navigator is missing
    if (typeof window === 'undefined' || !window?.navigator) {
      return true;
    }

    // Check if global.navigator indicates React Native (for environments where window might be mocked but global reflects RN)
    if (
      typeof global !== 'undefined' &&
      global?.navigator?.product === 'ReactNative'
    ) {
      return true;
    }

    // Check if window.navigator indicates React Native
    if (window.navigator?.product === 'ReactNative') {
      return true;
    }

    // Otherwise, it's likely a browser environment
    return false;
  }

  isNotBrowser() {
    return PlatformManager.isNotBrowser();
  }

  static isBrowser() {
    return !this.isNotBrowser();
  }

  isBrowser() {
    return PlatformManager.isBrowser();
  }

  isNodeJS() {
    return this.isNotBrowser() && !this.isReactNative();
  }

  isUseDeepLink() {
    return this.state.useDeeplink;
  }

  getPlatformType() {
    return getPlatformType(this);
  }
}
