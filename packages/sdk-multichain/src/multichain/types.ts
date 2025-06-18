import type { RPCAPI } from 'src/domain/multichain';
import type { StoreAdapter } from '../domain/store/adapter';
import type { StoreClient } from '../domain/store/client';

export type MultichainSDKConstructor = {
  dapp?: { name: string; url: string; logoUrl?: string };
  analytics: {enabled: false} | { enabled: true; integrationType: string };
  logging: { logLevel: 'debug' | 'info' | 'warn' | 'error' | 'verbose' };
  storage: StoreClient;
  ui: { headless: boolean };
  transport?: {
    extensionId?: string;
  };
};


export type { SessionData } from "@metamask/multichain-api-client";

export type Scope<T extends RPCAPI = RPCAPI> = `eip155:${string}` | `solana:${string}` | `${Extract<keyof T, string>}:${string}`

export type MultichainSDKBaseOptions = Pick<
  MultichainSDKConstructor,
  'dapp' | 'analytics' | 'logging' | 'ui'
>;

export type MultichainSDKOptions = MultichainSDKBaseOptions & {
  storage: StoreAdapter;
};
