import { ChannelConfig } from '../types/ChannelConfig';

export interface StorageManagerProps {
  debug?: boolean;
  storageManager?: StorageManager;
}

export interface StorageManager {
  persistChannelConfig(channelConfig: ChannelConfig): Promise<void>;
  getPersistedChannelConfig(): Promise<ChannelConfig | undefined>;
  terminate(): Promise<void>;
}
