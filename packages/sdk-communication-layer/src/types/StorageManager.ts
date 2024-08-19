import { ChannelConfig } from './ChannelConfig';

export interface StorageManagerProps {
  enabled: boolean;
  debug?: boolean;
  duration?: number;
  // Allow user to customize Storage Manager
  storageManager?: StorageManager;
}
export interface StorageManager {
  persistChannelConfig(
    channelConfig: ChannelConfig,
    context?: string,
  ): Promise<void>;
  persistAccounts(accounts: string[], context?: string): Promise<void>;
  getCachedAccounts(): Promise<string[]>;
  getCachedChainId(): Promise<string | undefined>;
  persistChainId(chainId: string, context?: string): Promise<void>;
  getPersistedChannelConfig(options?: {
    context?: string;
  }): Promise<ChannelConfig | undefined>;
  terminate(channelId: string): Promise<void>;
}
