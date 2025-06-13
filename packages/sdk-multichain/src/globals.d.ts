import { MetaMaskInpageProvider } from '@metamask/providers';

import { StoreClient } from './domain';

declare module '@paulmillr/qr';

declare global {
  interface Window {
    // ReactNativeWebView?: any;
    // sdkProvider: SDKProvider;
    // ethereum?: SDKProvider;
    // mmsdk?: MetaMaskSDK;
    // extension?: MetaMaskInpageProvider;
    // extensions?: any[];
    // MSStream: unknown; // specific for older browser environment
  }
}
