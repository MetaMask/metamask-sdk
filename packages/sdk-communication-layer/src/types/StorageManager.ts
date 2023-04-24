import { ChannelConfig } from './ChannelConfig';

export interface StorageManagerProps {
  enabled: boolean;
  debug?: boolean;
  duration?: number;
  // Allow user to customize Storage Manager
  storageManager?: StorageManager;
}
export interface StorageManager {
  persistChannelConfig(channelConfig: ChannelConfig): Promise<void>;
  getPersistedChannelConfig(
    channelId: string,
  ): Promise<ChannelConfig | undefined>;
  terminate(channelId: string): Promise<void>;
}
