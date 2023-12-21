import { MetaMaskInpageProvider } from '@metamask/providers';
import {
  CommunicationLayerPreference,
  ConnectionStatus,
  DEFAULT_SERVER_URL,
  EventType,
  MessageType,
  PlatformType,
  ServiceStatus,
} from '@metamask/sdk-communication-layer';
import WebView from 'react-native-webview';
import { SDKProvider } from './provider/SDKProvider';
import { MetaMaskSDK, MetaMaskSDKOptions } from './sdk';
import { RPC_URLS_MAP } from './services/MetaMaskSDK/InitializerManager/setupReadOnlyRPCProviders';
import { PROVIDER_UPDATE_TYPE } from './types/ProviderUpdateType';
import type { SDKLoggingOptions } from './types/SDKLoggingOptions';

declare global {
  interface Window {
    ReactNativeWebView?: WebView;
    sdkProvider: SDKProvider;
    ethereum?: SDKProvider;
    mmsdk?: MetaMaskSDK;
    extension?: MetaMaskInpageProvider;
    extensions?: any[];
    MSStream: unknown;
  }
}

export type {
  CommunicationLayerPreference,
  RPC_URLS_MAP,
  MetaMaskSDKOptions,
  SDKLoggingOptions,
  ServiceStatus,
};

export {
  DEFAULT_SERVER_URL,
  EventType,
  MetaMaskSDK,
  SDKProvider,
  PROVIDER_UPDATE_TYPE,
  PlatformType,
  ConnectionStatus,
  MessageType,
};

export default MetaMaskSDK;
