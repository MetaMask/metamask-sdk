import type { ChannelConfig, StoreClient, StoreAdapter } from "../domain";


export class Store implements StoreClient {
  readonly #adapter: StoreAdapter;

  constructor(adapter: StoreAdapter) {
    this.#adapter = adapter;
  }

  async getAnonId(): Promise<string | null> {
    return this.#adapter.getItem('anonId');
  }

  async getExtensionId(): Promise<string | null> {
    return this.#adapter.getItem('extensionId');
  }

  async getChannelConfig(): Promise<ChannelConfig | null> {
    const channelConfig = await this.#adapter.getItem('channelConfig');
    if (!channelConfig) {
      return null;
    }
    return JSON.parse(channelConfig)
  }

  async setChannelConfig(channelConfig: ChannelConfig): Promise<void> {
    return this.#adapter.setItem('channelConfig', JSON.stringify(channelConfig));
  }

  async setAnonId(anonId: string): Promise<void> {
    return this.#adapter.setItem('anonId', anonId);
  }

  async setExtensionId(extensionId: string): Promise<void> {
    return this.#adapter.setItem('extensionId', extensionId);
  }

  async removeExtensionId(): Promise<void> {
    return this.#adapter.deleteItem('extensionId');
  }

  async removeAnonId(): Promise<void> {
    return this.#adapter.deleteItem('anonId');
  }

  async getDebug(): Promise<string | null> {
    return this.#adapter.getItem('DEBUG');
  }
}
