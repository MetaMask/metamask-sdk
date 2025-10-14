import {
  CommunicationLayerPreference,
  ConnectionStatus,
  DEFAULT_SERVER_URL,
  EventType,
  MessageType,
  PlatformType,
  ServiceStatus,
  RPCMethodResult,
  RPCMethodCache,
} from '@metamask/sdk-communication-layer';
import { SDKProvider } from './provider/SDKProvider';
import { MetaMaskSDK, MetaMaskSDKOptions } from './sdk';
import { RpcUrlsMap } from './services/MetaMaskSDK/InitializerManager/setupReadOnlyRPCProviders';
import { PROVIDER_UPDATE_TYPE } from './types/ProviderUpdateType';

import type { SDKLoggingOptions } from './types/SDKLoggingOptions';
import {
  MetaMaskSDKEvent,
  MetaMaskSDKEventType,
} from './types/MetaMaskSDKEvents';

// eslint-disable-next-line spaced-comment
/*#if _REACTNATIVE
export { StorageManagerAS } from './storage-manager/StorageManagerAS';
/*#endif */

export type {
  RpcUrlsMap,
  MetaMaskSDKOptions,
  SDKLoggingOptions,
  ServiceStatus,
  MetaMaskSDKEventType,
};

export {
  DEFAULT_SERVER_URL,
  MetaMaskSDKEvent,
  EventType,
  CommunicationLayerPreference,
  MetaMaskSDK,
  SDKProvider,
  PROVIDER_UPDATE_TYPE,
  PlatformType,
  ConnectionStatus,
  MessageType,
  RPCMethodResult,
  RPCMethodCache,
};

export default MetaMaskSDK;
