// Direct exports to avoid circular dependencies
export { EventEmitter } from './events';

export { isNotBrowser, isReactNative } from './platform';

export { StoreAdapter, StoreClient, Store } from './store';
export type { StoreOptions } from './store';

export { MultichainSDKBase } from './multichain';
export type {
  RPCAPI,
  Notification,
  NotificationCallback,
  InvokeMethodOptions,
  MultichainSDKConstructor,
  SessionData,
  Scope,
  MultichainSDKBaseOptions,
  MultichainSDKOptions,
} from './multichain';

export type { default as EIP155 } from './multichain/api/eip155';
export type { RpcMethod } from './multichain/api/types';
