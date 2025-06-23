import { PlatformType } from '@metamask/sdk-communication-layer';
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
    if (typeof window === 'undefined' || !window.navigator) {
      return false;
    }

    const { userAgent } = window.navigator;

    // Check for mobile devices
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/iu;

    // Check for tablets (iPad is already in mobile regex, this catches Android tablets)
    const tabletRegex = /(?:iPad|Android(?!.*Mobile)|Tablet)/iu;

    return mobileRegex.test(userAgent) || tabletRegex.test(userAgent);
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
    return (
      typeof window === 'undefined' ||
      !window?.navigator ||
      (typeof global !== 'undefined' &&
        global?.navigator?.product === 'ReactNative') ||
      navigator?.product === 'ReactNative'
    );
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
