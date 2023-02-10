import { ChannelConfig } from './ChannelConfig';

export interface StorageManagerProps {
  debug?: boolean;
  storageManager?: StorageManager;
}
export interface StorageManager {
  persistChannelConfig(channelConfig: ChannelConfig): Promise<void>;
  getPersistedChannelConfig(
    channelId: string,
  ): Promise<ChannelConfig | undefined>;
  terminate(channelId: string): Promise<void>;
}
