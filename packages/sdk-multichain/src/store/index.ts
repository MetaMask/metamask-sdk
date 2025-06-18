import type { StoreClient } from "../domain/store/client";
import type { StoreAdapter } from "../domain/store/adapter";


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
