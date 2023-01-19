import * as fs from 'fs';
import { STORAGE_PATH } from '../config';
import { ChannelConfig } from '../types/ChannelConfig';

export class StorageManager {
  private constructor() {
    // utility class, no need to instantiate
  }

  public static persistChannelConfig(channelConfig: ChannelConfig) {
    const payload = JSON.stringify(channelConfig);
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_PATH, payload);
    } else {
      fs.writeFileSync(STORAGE_PATH, payload);
    }
    console.debug(`StorageManager::persistChannel `, payload);
  }

  public static getPersistedChannelConfig(): ChannelConfig | undefined {
    let payload;
    if (this.hasLocalStorage()) {
      payload = localStorage.getItem(STORAGE_PATH);
    } else {
      payload = fs.readFileSync(STORAGE_PATH).toString('utf-8');
    }

    console.debug(`StorageManager::getPersistedChannel payload`, payload);

    if (!payload) {
      return undefined;
    }

    const channelConfig = JSON.parse(payload) as ChannelConfig;
    // Make sure the date is parsed correctly
    channelConfig.validUntil = new Date(channelConfig.validUntil);
    console.debug(
      `StorageManager::getPersisChannel channelConfig`,
      channelConfig,
    );
    return channelConfig;
  }

  private static hasLocalStorage() {
    // basic localStorage tests, could be improved by actually trying to write on storage
    return typeof localStorage !== 'undefined';
  }
}
