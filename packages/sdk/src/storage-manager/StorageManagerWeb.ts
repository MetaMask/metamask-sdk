import {
  ChannelConfig,
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { STORAGE_PATH } from '../config';

export class StorageManagerWeb implements StorageManager {
  private debug = false;

  constructor({ debug }: StorageManagerProps | undefined = { debug: false }) {
    if (debug) {
      this.debug = debug;
    }
  }

  public async persistChannelConfig(channelConfig: ChannelConfig) {
    const payload = JSON.stringify(channelConfig);

    if (this.debug) {
      console.debug(`StorageManagerWeb::persistChannelConfig()`, channelConfig);
    }

    localStorage.setItem(STORAGE_PATH, payload);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    let payload;

    try {
      if (this.debug) {
        console.debug(`StorageManagerWeb::getPersistedChannelConfig()`);
      }

      payload = localStorage.getItem(STORAGE_PATH);

      if (this.debug) {
        console.debug(
          `StorageManagerWeb::getPersistedChannelConfig()`,
          payload,
        );
      }

      if (!payload) {
        return undefined;
      }

      const channelConfig = JSON.parse(payload) as ChannelConfig;
      if (this.debug) {
        console.debug(
          `StorageManagerWeb::getPersisChannel channelConfig`,
          channelConfig,
        );
      }

      return channelConfig;
    } catch (e) {
      console.debug(`Can't find existing channel config`, e);
      // Ignore errors
      return undefined;
    }
  }

  public async terminate(): Promise<void> {
    if (this.debug) {
      console.debug(`StorageManagerWeb::terminate()`);
    }

    localStorage.removeItem(STORAGE_PATH);
  }
}
