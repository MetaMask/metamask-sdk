import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ChannelConfig,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { logger } from '../utils/logger';
import {
  STORAGE_DAPP_CHAINID,
  STORAGE_DAPP_SELECTED_ADDRESS,
  STORAGE_PATH,
} from '../config';

export class StorageManagerAS implements StorageManager {
  private enabled = false;

  constructor(
    { enabled }: StorageManagerProps | undefined = {
      enabled: false,
    },
  ) {
    this.enabled = enabled;
  }

  public async persistChannelConfig(
    channelConfig: ChannelConfig,
    context?: string,
  ) {
    const payload = JSON.stringify(channelConfig);

    logger(
      `[StorageManagerAS: persistChannelConfig()] context=${context} enabled=${this.enabled}`,
      channelConfig,
    );

    await AsyncStorage.setItem(STORAGE_PATH, payload);
  }

  public async persistAccounts(accounts: string[], context?: string) {
    logger(
      `[StorageManagerAS: persistAccounts()] context=${context} enabled=${this.enabled}`,
      accounts,
    );

    try {
      const payload = JSON.stringify(accounts);
      await AsyncStorage.setItem(STORAGE_DAPP_SELECTED_ADDRESS, payload);
    } catch (error) {
      console.error(
        `[StorageManagerAS: persistAccounts()] Error persisting accounts`,
        error,
      );
    }
  }

  public async getCachedAccounts(): Promise<string[]> {
    let payload;

    try {
      // check if file exists first
      payload = await AsyncStorage.getItem(STORAGE_DAPP_SELECTED_ADDRESS);
      return payload ? JSON.parse(payload) : [];
    } catch (error) {
      console.error(
        `[StorageManagerAS: getCachedAccounts()] Error getting cached accounts`,
        error,
      );
      return [];
    }
  }

  public async getCachedChainId(): Promise<string | undefined> {
    try {
      const chainId =
        (await AsyncStorage.getItem(STORAGE_DAPP_CHAINID)) ?? undefined;
      if (chainId?.indexOf('0x') !== -1) {
        return chainId;
      }
      return undefined;
    } catch (error) {
      console.error(
        `[StorageManagerAS: getCachedChainId()] Error getting cached chainId`,
        error,
      );
      return undefined;
    }
  }

  public async persistChainId(chainId: string, context?: string) {
    logger(
      `[StorageManagerAS: persistChainId()] context=${context} enabled=${this.enabled}`,
      chainId,
    );

    try {
      await AsyncStorage.setItem(STORAGE_DAPP_CHAINID, chainId);
    } catch (error) {
      console.error(
        `[StorageManagerAS: persistChainId()] Error persisting chainId`,
        error,
      );
    }
  }

  public async getPersistedChannelConfig(options?: {
    context?: string;
  }): Promise<ChannelConfig | undefined> {
    let payload;
    const { context } = options || {};

    try {
      logger(
        `[StorageManagerAS: getPersistedChannelConfig()] context=${context} enabled=${this.enabled}`,
      );

      payload = await AsyncStorage.getItem(STORAGE_PATH);

      if (!payload) {
        return undefined;
      }

      const channelConfig = JSON.parse(payload) as ChannelConfig;
      logger(
        `[StorageManagerAS: getPersistedChannelConfig()] context=${context}  channelConfig`,
        channelConfig,
      );

      return channelConfig;
    } catch (e) {
      console.error(
        `[StorageManagerAS: getPersistedChannelConfig()] Can't find existing channel config`,
        e,
      );
      // Ignore errors
      return undefined;
    }
  }

  public async terminate(): Promise<void> {
    logger(`[StorageManagerAS: terminate()] enabled=${this.enabled}`);

    await AsyncStorage.removeItem(STORAGE_PATH);
    await AsyncStorage.removeItem(STORAGE_DAPP_CHAINID);
    await AsyncStorage.removeItem(STORAGE_DAPP_SELECTED_ADDRESS);
  }
}
