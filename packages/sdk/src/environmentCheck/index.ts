import Bowser from 'bowser';
import Ethereum from '../services/Ethereum';


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

export const notBrowser = () => typeof window === 'undefined' || !window?.navigator || (typeof global !== 'undefined' && global?.navigator?.product === "ReactNative") || navigator?.product === "ReactNative"
