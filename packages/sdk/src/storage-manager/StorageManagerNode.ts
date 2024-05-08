import fs from 'fs';
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

export class StorageManagerNode implements StorageManager {
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
      `[StorageManagerNode: persistChannelConfig()] enabled=${this.enabled}`,
      channelConfig,
    );

    fs.writeFileSync(STORAGE_PATH, payload);
  }

  public async persistAccounts(accounts: string[]) {
    logger(
      `[StorageManagerNode: persistAccounts()] enabled=${this.enabled}`,
      accounts,
    );

    const payload = JSON.stringify(accounts);
    fs.writeFileSync(STORAGE_DAPP_SELECTED_ADDRESS, payload);
  }

  public async getCachedAccounts(): Promise<string[]> {
    try {
      const rawAccounts = fs
        .readFileSync(STORAGE_DAPP_SELECTED_ADDRESS)
        .toString('utf-8');
      return JSON.parse(rawAccounts) as string[];
    } catch (error) {
      console.error(
        `[StorageManagerNode: getCachedAccounts()] Error reading cached accounts`,
        error,
      );
      throw error;
    }
  }

  public async persistChainId(chainId: string) {
    logger(
      `[StorageManagerNode: persistChainId()] enabled=${this.enabled}`,
      chainId,
    );

    fs.writeFileSync(STORAGE_DAPP_CHAINID, chainId);
  }

  public async getCachedChainId(): Promise<string | undefined> {
    try {
      const rawChainId = fs
        .readFileSync(STORAGE_DAPP_CHAINID)
        .toString('utf-8');
      return rawChainId;
    } catch (error) {
      console.error(
        `[StorageManagerNode: getCachedChainId()] Error reading cached chainId`,
        error,
      );
      throw error;
    }
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    if (!fs.existsSync(STORAGE_PATH)) {
      return Promise.resolve(undefined);
    }

    const payload = fs.readFileSync(STORAGE_PATH).toString('utf-8');
    logger(
      `[StorageManagerNode: getPersistedChannelConfig()] enabled=${this.enabled}`,
      payload,
    );

    if (!payload) {
      return Promise.resolve(undefined);
    }

    const channelConfig = JSON.parse(payload) as ChannelConfig;
    // Make sure the date is parsed correctly
    logger(
      `[StorageManagerNode: getPersisChannel()] channelConfig`,
      channelConfig,
    );

    return Promise.resolve(channelConfig);
  }

  public async terminate(): Promise<void> {
    logger(`[StorageManagerNode: terminate()] enabled=${this.enabled}`);

    if (fs.existsSync(STORAGE_PATH)) {
      fs.unlinkSync(STORAGE_PATH);
    }
  }
}
