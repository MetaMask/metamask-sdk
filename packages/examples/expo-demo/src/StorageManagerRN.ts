import {ChannelConfig} from '@metamask/sdk-communication-layer';
import {
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_PATH = 'temp';

export class StorageManagerRN implements StorageManager {
  private debug = false;

  constructor(
    {debug}: StorageManagerProps | undefined = {debug: false, enabled: true},
  ) {
    if (debug) {
      this.debug = debug;
    }
  }

  public async persistChannelConfig(channelConfig: ChannelConfig) {
    const payload = JSON.stringify(channelConfig);

    if (this.debug) {
      console.debug('StorageManagerRN::persistChannelConfig()', channelConfig);
    }

    await AsyncStorage.setItem(STORAGE_PATH, payload, () => {
      if (this.debug) {
        console.debug(
          'StorageManagerRN::persisChannelConfig() saved to storage.',
          AsyncStorage,
        );
      }
    });
    const temp = await this.getPersistedChannelConfig();
    console.debug('StorageManagerRN::peristChannelConfig() temp find', temp);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    let payload;

    if (this.debug) {
      console.debug(
        'StorageManagerRN::getPersistedChannelConfig()',
        AsyncStorage,
      );
    }

    try {
      payload = await AsyncStorage.getItem(STORAGE_PATH);
    } catch (e) {
      return undefined;
    }

    if (this.debug) {
      console.debug('StorageManagerRN::getPersistedChannelConfig()', payload);
    }

    if (!payload) {
      return undefined;
    }

    const channelConfig = JSON.parse(payload) as ChannelConfig;
    // Make sure the date is parsed correctly
    channelConfig.validUntil = channelConfig.validUntil;
    if (this.debug) {
      console.debug(
        'StorageManagerRN::getPersisChannel channelConfig',
        channelConfig,
      );
    }

    return channelConfig;
  }

  public async terminate(): Promise<void> {
    if (this.debug) {
      console.debug('StorageManagerRN::terminate()');
    }

    await AsyncStorage.removeItem(STORAGE_PATH);
  }
}
