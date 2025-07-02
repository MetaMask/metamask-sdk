import type { MultichainSDKBase, MultichainSDKBaseOptions } from './multichain';
import type { StoreOptions } from './store/adapter';

// Direct exports to avoid circular dependencies
export { EventEmitter } from './events';

export { isNotBrowser, isReactNative } from './platform';

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

export type { UIManager, UIModalController, ConnectionModalOptions, PlatformUIOptions } from './ui';
export { createUIManager } from './ui/factory';

export type CreateMultichainFN =
  (options: MultichainSDKBaseOptions) => Promise<MultichainSDKBase>
