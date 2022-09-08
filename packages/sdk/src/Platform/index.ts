import Bowser from 'bowser';
import Ethereum from '../services/Ethereum';
import WakeLock from './WakeLock';

export enum PlatformName {
  // React Native or Nodejs
  NonBrowser = 'NonBrowser',
  // MetaMask Mobile in-app browser
  MetaMaskMobileWebview = 'MetaMaskMobileWebview',
  // Desktop Browser
  DesktopWeb = 'DesktopWeb',
  // Mobile Browser
  MobileWeb = 'MobileWeb',
}

export enum WakeLockType {
  Disabled = 'Disabled',
  Temporary = 'Temporary',
  UntilResponse = 'UntilResponse',
}

export const isMetaMaskInstalled = () => {
  const eth = Ethereum.ethereum || window?.ethereum;
  return eth?.isMetaMask && eth?.isConnected();
};

export const isMobile = () => {
  const browser = Bowser.parse(window.navigator.userAgent);
  console.log(browser);
  return (
    browser?.platform?.type === 'mobile' || browser?.platform?.type === 'tablet'
  );
};

export const isMetaMaskMobileWebView = () => {
  return (
    Boolean(window.ReactNativeWebView) &&
    Boolean(navigator.userAgent.endsWith('MetaMaskMobile'))
  );
};

export const isNotBrowser = () =>
  typeof window === 'undefined' ||
  !window?.navigator ||
  (typeof global !== 'undefined' &&
    global?.navigator?.product === 'ReactNative') ||
  navigator?.product === 'ReactNative';

const getPlatform = () => {
  if (isNotBrowser()) {
    return PlatformName.NonBrowser;
  }

  if (isMetaMaskMobileWebView()) {
    return PlatformName.MetaMaskMobileWebview;
  }

  if (isMobile()) {
    return PlatformName.MobileWeb;
  }

  return PlatformName.DesktopWeb;
};

const Platform = {
  wakeLock: new WakeLock(),
  wakeLockType: WakeLockType.Temporary,
  wakeLockTimer: null,
  wakeLockFeatureActive: false,
  enableWakeLock() {
    if (this.wakeLockType === WakeLockType.Disabled) {
      return;
    }

    this.wakeLock.enable();

    const maxTime = this.wakeLockType === WakeLockType.Temporary ? 2000 : 20000;

    // At the most wake lock a maximum of time
    this.wakeLockTimer = setTimeout(() => {
      this.disableWakeLock();
    }, maxTime);

    if (
      !this.wakeLockFeatureActive &&
      this.WakeLockType === WakeLockType.UntilResponse
    ) {
      this.wakeLockFeatureActive = true;
      window.addEventListener('focus', () => this.disableWakeLock());
    }
  },
  disableWakeLock() {
    if (this.wakeLockType === WakeLockType.Disabled) {
      return;
    }

    clearTimeout(this.wakeLockTimer);
    this.wakeLock.disable();
  },
  platform: null,
  useDeeplink: null,
  preferredOpenLink: null,
  openDeeplink(universalLink: string, deeplink: string, target?: string) {
    // #if _WEB
    this.enableWakeLock();
    // #endif

    if (this.preferredOpenLink) {
      this.preferredOpenLink(universalLink, target);
      return;
    }

    if (typeof window !== 'undefined') {
      let win;
      if (Platform.useDeeplink) {
        win = window.open(deeplink, '_blank');
      } else {
        win = window.open(universalLink, '_blank');
      }
      setTimeout(() => win?.close?.(), 500);
    }

    // console.log('Please setup the openDeeplink parameter');
  },
  isMetaMaskInstalled,
  isMobile,
  isMetaMaskMobileWebView,
  isNotBrowser,
  getPlatform() {
    if (this.platform) {
      return this.platform;
    }

    this.platform = getPlatform();

    return this.platform;
  },
};

export default Platform;
