import { PlatformType } from '@metamask/sdk-communication-layer';
import Bowser from 'bowser';
import { disableWakeLock } from '../services/PlatfformManager/disableWakeLock';
import { enableWakeLock } from '../services/PlatfformManager/enableWakeLock';
import { getPlatformType } from '../services/PlatfformManager/getPlatformType';
import { isMetaMaskInstalled } from '../services/PlatfformManager/isMetaMaskInstalled';
import { openDeeplink } from '../services/PlatfformManager/openDeeplink';
import { WakeLockStatus } from '../types/WakeLockStatus';
import { WakeLockManager } from './WakeLockManager';

export const TEMPORARY_WAKE_LOCK_TIME = 2000;
export const UNTIL_RESPONSE_WAKE_LOCK_TIME = 40000;
export const LINK_OPEN_DELAY = 500;

interface PlatformProps {
  useDeepLink: boolean;
  preferredOpenLink?: (link: string, target?: string) => void;
  wakeLockStatus?: WakeLockStatus;
  debug?: boolean;
}

interface PlatformManagerState {
  wakeLock: WakeLockManager;
  wakeLockStatus: WakeLockStatus;
  wakeLockTimer?: NodeJS.Timeout;
  wakeLockFeatureActive: boolean;
  platformType?: PlatformType;
  useDeeplink: boolean;
  preferredOpenLink?: (link: string, target?: string) => void;
  debug: boolean;
}

export class PlatformManager {
  public state: PlatformManagerState = {
    wakeLock: new WakeLockManager(),
    wakeLockStatus: WakeLockStatus.UntilResponse,
    wakeLockTimer: undefined,
    wakeLockFeatureActive: false,
    platformType: undefined,
    useDeeplink: false,
    preferredOpenLink: undefined,
    debug: false,
  };

  constructor({
    useDeepLink,
    preferredOpenLink,
    wakeLockStatus = WakeLockStatus.UntilResponse,
    debug = false,
  }: PlatformProps) {
    this.state.platformType = this.getPlatformType();
    this.state.useDeeplink = useDeepLink;
    this.state.preferredOpenLink = preferredOpenLink;
    this.state.wakeLockStatus = wakeLockStatus;
    this.state.debug = debug;
    this.state.wakeLock.setDebug(debug);
  }

  enableWakeLock() {
    return enableWakeLock(this);
  }

  disableWakeLock() {
    return disableWakeLock(this);
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

  isNotBrowser() {
    return (
      typeof window === 'undefined' ||
      !window?.navigator ||
      (typeof global !== 'undefined' &&
        global?.navigator?.product === 'ReactNative') ||
      navigator?.product === 'ReactNative'
    );
  }

  isNodeJS() {
    return this.isNotBrowser() && !this.isReactNative();
  }

  isBrowser() {
    return !this.isNotBrowser();
  }

  isUseDeepLink() {
    return this.state.useDeeplink;
  }

  getPlatformType() {
    return getPlatformType(this);
  }
}
