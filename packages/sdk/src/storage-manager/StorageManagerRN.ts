import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ChannelConfig,
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { STORAGE_PATH } from '../config';

export class StorageManagerRN implements StorageManager {
  private debug = false;

  constructor({ debug }: StorageManagerProps | undefined = { debug: false }) {
    if (debug) {
      this.debug = debug;
    }
  }

  public async persistChannelConfig(channelConfig: ChannelConfig) {
    const payload = JSON.stringify(channelConfig);

    if (this.debug) {
      console.debug(`StorageManagerRN::persistChannelConfig()`, channelConfig);
    }

    await AsyncStorage.setItem(STORAGE_PATH, payload);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    let payload;

    try {
      if (this.debug) {
        console.debug(`StorageManagerRN::getPersistedChannelConfig()`);
      }

      payload = await AsyncStorage.getItem(STORAGE_PATH);

      if (this.debug) {
        console.debug(`StorageManagerRN::getPersistedChannelConfig()`, payload);
      }

      if (!payload) {
        return undefined;
      }

      const channelConfig = JSON.parse(payload) as ChannelConfig;
      // Make sure the date is parsed correctly
      channelConfig.validUntil = new Date(channelConfig.validUntil);
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
      return Promise.resolve(undefined);
    }
  }

  public async terminate(): Promise<void> {
    if (this.debug) {
      console.debug(`StorageManagerRN::terminate()`);
    }

    await AsyncStorage.removeItem(STORAGE_PATH);
  }
}
