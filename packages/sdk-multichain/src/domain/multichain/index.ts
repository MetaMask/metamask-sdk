import type {
  SessionData,
} from '@metamask/multichain-api-client';
import type { CaipAccountId, Json } from '@metamask/utils';

import type EIP155 from './api/eip155';
import type { StoreClient } from '../store/client';

export type RPCAPI = {
  eip155: EIP155;
};

export type Notification = {
  method: string;
  params?: Json;
  jsonrpc?: string;
};

export type NotificationCallback = (notification: unknown) => void;

// Type for invoke method options that accepts any valid scope/method combination
export type InvokeMethodOptions = {
  scope: Scope<RPCAPI>;
  request: {
    method: string;
    params: Json;
  };
};

export abstract class MultichainSDKBase {
  abstract connect(options?: { extensionId?: string }): Promise<boolean>;

  abstract disconnect(): Promise<void>;

  abstract getSession(): Promise<SessionData | undefined>;

  abstract createSession(
    scopes: Scope[],
    caipAccountIds: CaipAccountId[],
  ): Promise<SessionData>;

  abstract revokeSession(): Promise<void>;

  abstract onNotification(listener: NotificationCallback): () => void;

  abstract invokeMethod(options: InvokeMethodOptions): Promise<Json>;
}

export type MultichainSDKConstructor = {
  dapp: { name: string; url: string; logoUrl?: string };
  analytics: { enabled: false } | { enabled: true; integrationType: string };
  logging: { logLevel: 'debug' | 'info' | 'warn' | 'error' | 'verbose' };
  storage: StoreClient;
  ui: { headless: boolean };
  transport?: {
    extensionId?: string;
  };
};

export type { SessionData } from '@metamask/multichain-api-client';

export type Scope<T extends RPCAPI = RPCAPI> =
  | `eip155:${string}`
  | `solana:${string}`
  | `${Extract<keyof T, string>}:${string}`;

export type MultichainSDKBaseOptions = Pick<
  MultichainSDKConstructor,
  'dapp' | 'analytics' | 'logging' | 'ui'
>;

export type MultichainSDKOptions = MultichainSDKBaseOptions & {
  storage: StoreClient;
};
