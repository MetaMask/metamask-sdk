import { PlatformType } from '@metamask/sdk-communication-layer';
import Bowser from 'bowser';

import { Ethereum } from '../services/Ethereum';
import { WakeLockStatus } from '../types/WakeLockStatus';
import { WakeLockManager } from './WakeLockManager';

const TEMPORARY_WAKE_LOCK_TIME = 2000;
const UNTIL_RESPONSE_WAKE_LOCK_TIME = 20000;
const LINK_OPEN_DELAY = 500;

interface PlatformProps {
  useDeepLink: boolean;
  preferredOpenLink?: (link: string, target?: string) => void;
  wakeLockStatus?: WakeLockStatus;
  debug?: boolean;
}

/**
 * Singleton class instance
 */
export class Platform {
  private static instance: Platform;

  private wakeLock = new WakeLockManager();

  private wakeLockStatus = WakeLockStatus.Temporary;

  private wakeLockTimer?: NodeJS.Timeout;

  private wakeLockFeatureActive = false;

  private platformType: PlatformType;

  private useDeeplink = false;

  private preferredOpenLink?;

  private debug = false;

  private constructor({
    useDeepLink,
    preferredOpenLink,
    wakeLockStatus = WakeLockStatus.Temporary,
    debug = false,
  }: PlatformProps) {
    this.platformType = this.getPlatformType();
    this.useDeeplink = useDeepLink;
    this.preferredOpenLink = preferredOpenLink;
    this.wakeLockStatus = wakeLockStatus;
    this.debug = debug;
  }

  public static init(props: PlatformProps): Platform {
    Platform.instance = new Platform(props);
    return Platform.instance;
  }

  public static getInstance(): Platform {
    if (!Platform.instance) {
      throw new Error('Platform not initialied - call Platform.init() first.');
    }

    return Platform.instance;
  }

  enableWakeLock() {
    if (this.wakeLockStatus === WakeLockStatus.Disabled) {
      return;
    }

    this.wakeLock.enable();

    const maxTime =
      this.wakeLockStatus === WakeLockStatus.Temporary
        ? TEMPORARY_WAKE_LOCK_TIME
        : UNTIL_RESPONSE_WAKE_LOCK_TIME;

    // At the most wake lock a maximum of time
    this.wakeLockTimer = setTimeout(() => {
      this.disableWakeLock();
    }, maxTime) as unknown as NodeJS.Timeout;

    if (
      !this.wakeLockFeatureActive &&
      this.wakeLockStatus === WakeLockStatus.UntilResponse
    ) {
      this.wakeLockFeatureActive = true;
      window.addEventListener('focus', () => this.disableWakeLock());
    }
  }

  disableWakeLock() {
    if (this.wakeLockStatus === WakeLockStatus.Disabled) {
      return;
    }

    if (this.wakeLockTimer) {
      clearTimeout(this.wakeLockTimer as NodeJS.Timeout);
    }

    this.wakeLock.disable();
  }

  openDeeplink(universalLink: string, deeplink: string, target?: string) {
    if (this.debug) {
      console.debug(
        `Platform::openDeepLink universalLink --> ${universalLink}`,
      );
      console.debug(`Platform::openDeepLink deepLink --> ${deeplink}`);
    }

    if (this.isBrowser()) {
      this.enableWakeLock();
    }

    try {
      if (this.preferredOpenLink) {
        this.preferredOpenLink(universalLink, target);
        return;
      }

      if (typeof window !== 'undefined') {
        let win: Window | null;
        if (this.useDeeplink) {
          win = window.open(deeplink, '_blank');
        } else {
          win = window.open(universalLink, '_blank');
        }
        setTimeout(() => win?.close?.(), LINK_OPEN_DELAY);
      }
    } catch (err) {
      console.log(`Platform::openDeepLink() can't open link`, err);
    }

    // console.log('Please setup the openDeeplink parameter');
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
    const eth = Ethereum.getProvider() || window?.ethereum;
    if (this.debug) {
      console.debug(
        `Platform::isMetaMaskInstalled isMetaMask=${
          eth?.isMetaMask
        } isConnected=${eth?.isConnected()}`,
      );
    }
    return eth?.isMetaMask && eth?.isConnected();
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
    return this.platformType === PlatformType.MobileWeb;
  }

  isNotBrowser() {
    return (
      typeof window === 'undefined' ||
      !window?.navigator ||
      (typeof global !== 'undefined' &&
        global?.navigator?.product === 'ReactNative') ||
      navigator?.product === 'ReactNative'
    );
  }

  isBrowser() {
    return !this.isNotBrowser();
  }

  isUseDeepLink() {
    return this.useDeeplink;
  }

  getPlatformType() {
    if (this.platformType) {
      return this.platformType;
    }

    if (this.isReactNative()) {
      return PlatformType.ReactNative;
    }

    if (this.isNotBrowser()) {
      return PlatformType.NonBrowser;
    }

    if (this.isMetaMaskMobileWebView()) {
      return PlatformType.MetaMaskMobileWebview;
    }

    if (this.isMobile()) {
      return PlatformType.MobileWeb;
    }

    return PlatformType.DesktopWeb;
  }
}