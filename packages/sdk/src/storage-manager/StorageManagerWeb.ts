import {
  ChannelConfig,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { logger } from '../utils/logger';
import { STORAGE_PATH } from '../config';

export class StorageManagerWeb implements StorageManager {
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
      `[StorageManagerWeb: persistChannelConfig()] enabled=${this.enabled}`,
      channelConfig,
    );

    localStorage.setItem(STORAGE_PATH, payload);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    let payload;

    try {
      logger(
        `[StorageManagerWeb: getPersistedChannelConfig()] enabled=${this.enabled}`,
      );

      payload = localStorage.getItem(STORAGE_PATH);

      logger(`[StorageManagerWeb: getPersistedChannelConfig()]`, payload);

      if (!payload) {
        return undefined;
      }

      const channelConfig = JSON.parse(payload) as ChannelConfig;
      logger(
        `[StorageManagerWeb: getPersistedChannelConfig()] channelConfig`,
        channelConfig,
      );

      return channelConfig;
    } catch (e) {
      console.error(
        `[StorageManagerWeb: getPersistedChannelConfig()] Can't find existing channel config`,
        e,
      );
      // Ignore errors
      return undefined;
    }
  }

  public async terminate(): Promise<void> {
    logger(`[StorageManagerWeb: terminate()] enabled=${this.enabled}`);

    localStorage.removeItem(STORAGE_PATH);
  }
}
