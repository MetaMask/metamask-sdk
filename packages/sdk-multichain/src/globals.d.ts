import { MetaMaskInpageProvider } from '@metamask/providers';

import { StoreClient } from './domain';
import type { MultichainSDK } from './multichain';

declare module '@paulmillr/qr';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare const mmsdk: any;

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (request: { method: string; params?: any[] }) => Promise<any>;
      on?: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener?: (eventName: string, handler: (...args: any[]) => void) => void;
    };
    ReactNativeWebView?: any;
    mmsdk?: any;
    extension?: any;
    // sdkProvider: SDKProvider;
    // ethereum?: SDKProvider;
    // mmsdk?: MetaMaskSDK;
    // extensions?: any[];
    // MSStream: unknown; // specific for older browser environment
  }

  namespace NodeJS {
    interface Global {
      navigator?: {
        product?: string;
      };
    }
  }
}
