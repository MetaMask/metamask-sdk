import { MetaMaskInpageProvider } from '@metamask/providers';

declare module '@paulmillr/qr';

declare global {
  interface Window {
    ReactNativeWebView?: any;
    sdkProvider: SDKProvider;
    ethereum?: SDKProvider;
    mmsdk?: MetaMaskSDK;
    extension?: MetaMaskInpageProvider;
    extensions?: any[];
    MSStream: unknown; // specific for older browser environment
  }
}
