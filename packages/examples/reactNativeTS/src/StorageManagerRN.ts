import {ChannelConfig} from '@metamask/sdk-communication-layer';
import {
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer/dist/browser/es/storage-manager/StorageManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_PATH = 'temp';

export class StorageManagerRN implements StorageManager {
  private debug = false;

  constructor({debug}: StorageManagerProps | undefined = {debug: false}) {
    if (debug) {
      this.debug = debug;
    }
  }

  public async persistChannelConfig(channelConfig: ChannelConfig) {
    const payload = JSON.stringify(channelConfig);

    if (this.debug) {
      console.debug('AAAAAAAAAAAAAAAAA::persistChannelConfig()', channelConfig);
    }

    await AsyncStorage.setItem(STORAGE_PATH, payload, () => {
      if (this.debug) {
        console.debug(
          'AAAAAAAAAAAAAAAAA::persisChannelConfig() saved to storage.',
          AsyncStorage,
        );
      }
    });
    const temp = await this.getPersistedChannelConfig();
    console.debug('AAAAAAAAAAAAAAAAA::peristChannelConfig() temp find', temp);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    let payload;

    if (this.debug) {
      console.debug(
        'AAAAAAAAAAAAAAAAA::getPersistedChannelConfig()',
        AsyncStorage,
      );
    }

    try {
      payload = await AsyncStorage.getItem(STORAGE_PATH);
    } catch (e) {
      return undefined;
    }

    if (this.debug) {
      console.debug('AAAAAAAAAAAAAAAAA::getPersistedChannelConfig()', payload);
    }

    if (!payload) {
      return undefined;
    }

    const channelConfig = JSON.parse(payload) as ChannelConfig;
    // Make sure the date is parsed correctly
    channelConfig.validUntil = new Date(channelConfig.validUntil);
    if (this.debug) {
      console.debug(
        'AAAAAAAAAAAAAAAAA::getPersisChannel channelConfig',
        channelConfig,
      );
    }

    return channelConfig;
  }

  public async terminate(): Promise<void> {
    if (this.debug) {
      console.debug('AAAAAAAAAAAAAAAAA::terminate()');
    }

    await AsyncStorage.removeItem(STORAGE_PATH);
  }
}
