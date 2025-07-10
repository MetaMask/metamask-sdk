import Bowser from 'bowser';

export enum PlatformType {
  // React Native or Nodejs
  NonBrowser = 'nodejs',
  // MetaMask Mobile in-app browser
  MetaMaskMobileWebview = 'in-app-browser',
  // Desktop Browser
  DesktopWeb = 'web-desktop',
  // Mobile Browser
  MobileWeb = 'web-mobile',
  // ReactNative
  ReactNative = 'react-native',
}


function isNotBrowser() {
  return (
    typeof window === 'undefined' ||
    !window?.navigator ||
    (typeof global !== 'undefined' &&
      global?.navigator?.product === 'ReactNative') ||
    navigator?.product === 'ReactNative'
  );
}

function isReactNative() {
  return (
    isNotBrowser() &&
    typeof window !== 'undefined' &&
    window?.navigator &&
    window.navigator?.product === 'ReactNative'
  ) ?? false;
}

function isMetaMaskMobileWebView() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.ReactNativeWebView) &&
    Boolean(navigator.userAgent.endsWith('MetaMaskMobile'))
  );
}

function isMobile() {
  const browser = Bowser.parse(window.navigator.userAgent);
  return (
    browser?.platform?.type === 'mobile' || browser?.platform?.type === 'tablet'
  );
}

/**
 *
 */
export function getPlatformType() {
  if (isReactNative()) {
    return PlatformType.ReactNative;
  }
  if (isNotBrowser()) {
    return PlatformType.NonBrowser;
  }
  if (isMetaMaskMobileWebView()) {
    return PlatformType.MetaMaskMobileWebview;
  }
  if (isMobile()) {
    return PlatformType.MobileWeb;
  }
  return PlatformType.DesktopWeb;
}
