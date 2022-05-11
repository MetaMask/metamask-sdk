import Bowser from 'bowser';
import Ethereum from '../services/Ethereum';

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

export const isMetaMaskInstalled = () => {
  const eth = Ethereum.ethereum || window?.ethereum;
  return eth?.isMetaMask && eth?.isConnected();
};

export const isMobile = () => {
  const browser = Bowser.parse(window.navigator.userAgent);
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

export const getPlatform = () => {
  if (isNotBrowser()) return PlatformName.NonBrowser;

  if (isMetaMaskMobileWebView()) return PlatformName.MetaMaskMobileWebview;

  if (isMobile()) return PlatformName.MobileWeb;

  return PlatformName.DesktopWeb;
};

const Platform = {
  platform: null,
  preferredOpenLink: null,
  openDeeplink(url: string, target?: string) {
    if (this.preferredOpenLink) return this.preferredOpenLink(url, target);

    if (typeof window !== 'undefined') return window.open(url, target);

    //throw new Error('Please setup the openDeeplink parameter');
    return
  },
  isMetaMaskInstalled,
  isMobile,
  isMetaMaskMobileWebView,
  isNotBrowser,
  getPlatform() {
    if (this.platform) return this.platform;

    this.platform = getPlatform();

    return this.platform;
  },
};

export default Platform;
