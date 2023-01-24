import { STORAGE_PATH } from '../config';
import { ChannelConfig } from '../types/ChannelConfig';
import { StorageManager, StorageManagerProps } from './StorageManager';

export class StorageManagerWeb implements StorageManager {
  private debug = false;

  constructor({ debug }: StorageManagerProps | undefined = { debug: false }) {
    if (debug) {
      this.debug = debug;
    }
  }

  public async persistChannelConfig(channelConfig: ChannelConfig) {
    if (!this.hasLocalStorage()) {
      console.warn(`localStorage not available.`);
      return;
    }

    const payload = JSON.stringify(channelConfig);

    if (this.debug) {
      console.debug(`StorageManagerWeb::persistChannelConfig()`, channelConfig);
    }

    localStorage.setItem(STORAGE_PATH, payload);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    if (!this.hasLocalStorage()) {
      console.warn(`localStorage not available.`);
      return Promise.resolve(undefined);
    }

    let payload;

    if (this.debug) {
      console.debug(
        `StorageManagerWeb::getPersistedChannelConfig()`,
        localStorage,
      );
    }

    try {
      payload = localStorage.getItem(STORAGE_PATH);
    } catch (e) {
      return Promise.resolve(undefined);
    }

    if (this.debug) {
      console.debug(`StorageManagerWeb::getPersistedChannelConfig()`, payload);
    }

    if (!payload) {
      return Promise.resolve(undefined);
    }

    const channelConfig = JSON.parse(payload) as ChannelConfig;
    // Make sure the date is parsed correctly
    channelConfig.validUntil = new Date(channelConfig.validUntil);
    if (this.debug) {
      console.debug(
        `StorageManagerWeb::getPersisChannel() channelConfig`,
        channelConfig,
      );
    }

    return Promise.resolve(channelConfig);
  }

  public async terminate(): Promise<void> {
    if (!this.hasLocalStorage()) {
      console.warn(`localStorage not available.`);
      return;
    }

    if (this.debug) {
      console.debug(`StorageManagerWeb::terminate()`);
    }

    localStorage.removeItem(STORAGE_PATH);
  }

  private hasLocalStorage() {
    return typeof localStorage !== 'undefined';
  }
}
