import {
  ChannelConfig,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import {
  STORAGE_DAPP_CHAINID,
  STORAGE_DAPP_SELECTED_ADDRESS,
  STORAGE_PATH,
} from '../config';
import { logger } from '../utils/logger';

export class StorageManagerWeb implements StorageManager {
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
      `[StorageManagerWeb: persistChannelConfig()] enabled=${this.enabled}`,
      channelConfig,
    );

    localStorage.setItem(STORAGE_PATH, payload);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    let payload;

    try {
      logger(
        `[StorageManagerWeb: getPersistedChannelConfig()] enabled=${this.enabled}`,
      );

      payload = localStorage.getItem(STORAGE_PATH);

      logger(`[StorageManagerWeb: getPersistedChannelConfig()]`, payload);

      if (!payload) {
        return undefined;
      }

      const channelConfig = JSON.parse(payload) as ChannelConfig;
      logger(
        `[StorageManagerWeb: getPersistedChannelConfig()] channelConfig`,
        channelConfig,
      );

      return channelConfig;
    } catch (e) {
      console.error(
        `[StorageManagerWeb: getPersistedChannelConfig()] Can't find existing channel config`,
        e,
      );
      // Ignore errors
      return undefined;
    }
  }

  public async persistAccounts(accounts: string[]) {
    logger(
      `[StorageManagerWeb: persistAccounts()] enabled=${this.enabled}`,
      accounts,
    );

    const payload = JSON.stringify(accounts);
    localStorage.setItem(STORAGE_DAPP_SELECTED_ADDRESS, payload);
  }

  public async getCachedAccounts(): Promise<string[]> {
    try {
      const rawAccounts = localStorage.getItem(STORAGE_DAPP_SELECTED_ADDRESS);
      if (!rawAccounts) {
        return [];
      }
      return JSON.parse(rawAccounts) as string[];
    } catch (error) {
      console.error(
        `[StorageManagerWeb: getCachedAccounts()] Error reading cached accounts`,
        error,
      );
      throw error;
    }
  }

  public async persistChainId(chainId: string) {
    logger(
      `[StorageManagerWeb: persistChainId()] enabled=${this.enabled}`,
      chainId,
    );

    localStorage.setItem(STORAGE_DAPP_CHAINID, chainId);
  }

  public async getCachedChainId(): Promise<string | undefined> {
    try {
      const chainId = localStorage.getItem(STORAGE_DAPP_CHAINID);
      return chainId ?? undefined;
    } catch (error) {
      console.error(
        `[StorageManagerWeb: getCachedChainId()] Error reading cached chainId`,
        error,
      );
      throw error;
    }
  }

  public async terminate(): Promise<void> {
    logger(`[StorageManagerWeb: terminate()] enabled=${this.enabled}`);

    localStorage.removeItem(STORAGE_PATH);
  }
}
