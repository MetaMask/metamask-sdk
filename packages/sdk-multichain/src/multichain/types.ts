import type { StoreAdapter } from '../domain/store/adapter';
import type { StoreClient } from '../domain/store/client';

export type MultichainSDKConstructor = {
  dapp: { name: string; url: string; logoUrl?: string };
  analytics: { enabled: boolean; integrationType: string };
  logging: { logLevel: 'debug' | 'info' | 'warn' | 'error' | 'verbose' };
  storage: StoreClient;
  ui: { headless: boolean };
  transport?: {
    extensionId?: string;
  };
};

export type MultichainSDKBaseOptions = Pick<
  MultichainSDKConstructor,
  'dapp' | 'analytics' | 'logging' | 'ui'
>;
export type MultichainSDKOptions = MultichainSDKBaseOptions & {
  storage: StoreAdapter;
};
