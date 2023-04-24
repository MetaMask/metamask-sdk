import fs from 'fs';
import {
  ChannelConfig,
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { STORAGE_PATH } from '../config';

export class StorageManagerNode implements StorageManager {
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
        `StorageManagerNode::persistChannelConfig() enabled=${this.enabled}`,
        channelConfig,
      );
    }

    fs.writeFileSync(STORAGE_PATH, payload);
  }

  public async getPersistedChannelConfig(): Promise<ChannelConfig | undefined> {
    if (!fs.existsSync(STORAGE_PATH)) {
      return Promise.resolve(undefined);
    }

    const payload = fs.readFileSync(STORAGE_PATH).toString('utf-8');
    if (this.debug) {
      console.debug(
        `StorageManagerNode::getPersistedChannelConfig() enabled=${this.enabled}`,
        payload,
      );
    }

    if (!payload) {
      return Promise.resolve(undefined);
    }

    const channelConfig = JSON.parse(payload) as ChannelConfig;
    // Make sure the date is parsed correctly
    if (this.debug) {
      console.debug(
        `StorageManagerNode::getPersisChannel() channelConfig`,
        channelConfig,
      );
    }

    return Promise.resolve(channelConfig);
  }

  public async terminate(): Promise<void> {
    if (this.debug) {
      console.debug(`StorageManagerNode::terminate() enabled=${this.enabled}`);
    }

    if (fs.existsSync(STORAGE_PATH)) {
      fs.unlinkSync(STORAGE_PATH);
    }
  }
}
