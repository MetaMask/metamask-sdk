import {
  CommunicationLayerPreference,
  ConnectionStatus,
  DEFAULT_SERVER_URL,
  EventType,
  ServiceStatus,
  MessageType,
  PlatformType,
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
    extension: unknown;
    MSStream: unknown;
  }
}

export {
  CommunicationLayerPreference,
  ConnectionStatus,
  DEFAULT_SERVER_URL,
  EventType,
  MessageType,
  RPC_URLS_MAP,
  MetaMaskSDK,
  PROVIDER_UPDATE_TYPE,
  PlatformType,
  SDKProvider,
};
export type { MetaMaskSDKOptions, SDKLoggingOptions, ServiceStatus };

export default MetaMaskSDK;
