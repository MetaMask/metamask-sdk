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
      // const fs = await import('fs');
      // console.log(`StorageManager::fs `, fs);
      // fs.writeFileSync(STORAGE_PATH, payload);
    }
    // console.debug(`StorageManager::persistChannel `, payload);
  }

  public static getPersistedChannelConfig(): ChannelConfig | undefined {
    let payload;
    if (this.hasLocalStorage()) {
      payload = localStorage.getItem(STORAGE_PATH);
    } else {
      // const fs = await import('fs');
      // payload = fs.readFileSync(STORAGE_PATH).toString('utf-8');
    }

    // console.debug(`StorageManager::getPersistedChannel payload`, payload);

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

  public static terminate(): void {
    console.debug(`StorageManager::terminate()`);
    if (this.hasLocalStorage()) {
      localStorage.removeItem(STORAGE_PATH);
    } else {
      // handle system without localStorage
    }
  }

  private static hasLocalStorage() {
    // basic localStorage tests, could be improved by actually trying to write on storage
    return typeof localStorage !== 'undefined';
  }
}
