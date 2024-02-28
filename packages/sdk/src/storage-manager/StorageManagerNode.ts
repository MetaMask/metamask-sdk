import fs from 'fs';
import {
  ChannelConfig,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { logger } from '../utils/logger';
import { STORAGE_PATH } from '../config';

export class StorageManagerNode implements StorageManager {
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
      `[StorageManagerNode: persistChannelConfig()] enabled=${this.enabled}`,
      channelConfig,
    );

    fs.writeFileSync(STORAGE_PATH, payload);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    if (!fs.existsSync(STORAGE_PATH)) {
      return Promise.resolve(undefined);
    }

    const payload = fs.readFileSync(STORAGE_PATH).toString('utf-8');
    logger(
      `[StorageManagerNode: getPersistedChannelConfig()] enabled=${this.enabled}`,
      payload,
    );

    if (!payload) {
      return Promise.resolve(undefined);
    }

    const channelConfig = JSON.parse(payload) as ChannelConfig;
    // Make sure the date is parsed correctly
    logger(
      `[StorageManagerNode: getPersisChannel()] channelConfig`,
      channelConfig,
    );

    return Promise.resolve(channelConfig);
  }

  public async terminate(): Promise<void> {
    logger(`[StorageManagerNode: terminate()] enabled=${this.enabled}`);

    if (fs.existsSync(STORAGE_PATH)) {
      fs.unlinkSync(STORAGE_PATH);
    }
  }
}
