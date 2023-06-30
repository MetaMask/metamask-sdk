import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ChannelConfig,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { STORAGE_PATH } from '../config';

export class StorageManagerAS implements StorageManager {
  private debug = false;

  private enabled = false;

  constructor(
    { debug, enabled }: StorageManagerProps | undefined = {
      debug: false,
      enabled: false,
    },
  ) {
    if (debug) {
      this.debug = debug;
    }

    this.enabled = enabled;
  }

  public async persistChannelConfig(channelConfig: ChannelConfig) {
    const payload = JSON.stringify(channelConfig);

    if (this.debug) {
      console.debug(
        `StorageManagerRN::persistChannelConfig() enabled=${this.enabled}`,
        channelConfig,
      );
    }

    await AsyncStorage.setItem(STORAGE_PATH, payload);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    let payload;

    try {
      if (this.debug) {
        console.debug(
          `StorageManagerRN::getPersistedChannelConfig() enabled=${this.enabled}`,
        );
      }

      payload = await AsyncStorage.getItem(STORAGE_PATH);

      if (this.debug) {
        console.debug(`StorageManagerRN::getPersistedChannelConfig()`, payload);
      }

      if (!payload) {
        return undefined;
      }

      const channelConfig = JSON.parse(payload) as ChannelConfig;
      if (this.debug) {
        console.debug(
          `StorageManagerRN::getPersisChannel channelConfig`,
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
      console.debug(`StorageManagerRN::terminate() enabled=${this.enabled}`);
    }

    await AsyncStorage.removeItem(STORAGE_PATH);
  }
}
