import WebView from 'react-native-webview';
import { MetaMaskSDK, MetaMaskSDKOptions } from './sdk';
import type { SDKLoggingOptions } from './types/SDKLoggingOptions';
import { SDKProvider } from './provider/SDKProvider';
import { PROVIDER_UPDATE_TYPE } from './types/ProviderUpdateType';

declare global {
  interface Window {
    ReactNativeWebView?: WebView;
    sdkProvider: SDKProvider;
    ethereum?: SDKProvider;
    extension: unknown;
    MSStream: unknown;
  }
}

export * from '@metamask/sdk-communication-layer';
export type { MetaMaskSDKOptions, SDKLoggingOptions };
export { MetaMaskSDK, SDKProvider, PROVIDER_UPDATE_TYPE };
export default MetaMaskSDK;
