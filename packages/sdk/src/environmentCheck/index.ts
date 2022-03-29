import Bowser from 'bowser';

export const isMetaMaskInstalled = (ethereum?: any) => {
  const eth = ethereum || window?.ethereum;
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
