import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ChannelConfig,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { logger } from '../utils/logger';
import { STORAGE_PATH } from '../config';

export class StorageManagerAS implements StorageManager {
  private enabled = false;

  constructor(
    { enabled }: StorageManagerProps | undefined = {
      enabled: false,
    },
  ) {
    this.enabled = enabled;
  }

  public async persistChannelConfig(channelConfig: ChannelConfig) {
    const payload = JSON.stringify(channelConfig);

    logger(
      `[StorageManagerAS: persistChannelConfig()] enabled=${this.enabled}`,
      channelConfig,
    );

    await AsyncStorage.setItem(STORAGE_PATH, payload);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    let payload;

    try {
      logger(
        `[StorageManagerAS: getPersistedChannelConfig()] enabled=${this.enabled}`,
      );

      payload = await AsyncStorage.getItem(STORAGE_PATH);

      logger(`[StorageManagerAS: getPersistedChannelConfig()]`, payload);

      if (!payload) {
        return undefined;
      }

      const channelConfig = JSON.parse(payload) as ChannelConfig;
      logger(
        `[StorageManagerAS: getPersistedChannelConfig()] channelConfig`,
        channelConfig,
      );

      return channelConfig;
    } catch (e) {
      console.error(
        `[StorageManagerAS: getPersistedChannelConfig()] Can't find existing channel config`,
        e,
      );
      // Ignore errors
      return undefined;
    }
  }

  public async terminate(): Promise<void> {
    logger(`[StorageManagerAS: terminate()] enabled=${this.enabled}`);

    await AsyncStorage.removeItem(STORAGE_PATH);
  }
}
