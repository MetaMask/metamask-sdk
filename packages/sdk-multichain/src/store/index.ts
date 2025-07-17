import { StorageDeleteErr, StorageGetErr, StorageSetErr } from "../domain/errors/storage";
import type {StoreClient, StoreAdapter } from "../domain";


export class Store implements StoreClient {
  readonly #adapter: StoreAdapter;

  constructor(adapter: StoreAdapter) {
    this.#adapter = adapter;
  }

  async getAnonId(): Promise<string | null> {
    try {
      return await this.#adapter.getItem('anonId');
    } catch (err) {
      throw new StorageGetErr(
        this.#adapter.platform,
        'anonId',
        err.message
      );
    }
  }

  async getExtensionId(): Promise<string | null> {
    try {
      return await this.#adapter.getItem('extensionId');
    } catch (err) {
      throw new StorageGetErr(
        this.#adapter.platform,
        'extensionId',
        err.message
      );
    }
  }

  async setAnonId(anonId: string): Promise<void> {
    try {
      return await this.#adapter.setItem('anonId', anonId);
    } catch (err) {
      throw new StorageSetErr(
        this.#adapter.platform,
        'anonId',
        err.message
      );
    }
  }

  async setExtensionId(extensionId: string): Promise<void> {
    try {
      return await this.#adapter.setItem('extensionId', extensionId);
    } catch (err) {
      throw new StorageSetErr(
        this.#adapter.platform,
        'extensionId',
        err.message
      );
    }
  }

  async removeExtensionId(): Promise<void> {
    try {
      return await this.#adapter.deleteItem('extensionId');
    } catch (err) {
      throw new StorageDeleteErr(
        this.#adapter.platform,
        'extensionId',
        err.message
      );
    }
  }

  async removeAnonId(): Promise<void> {
    try {
      return await this.#adapter.deleteItem('anonId');
    } catch (err) {
      throw new StorageDeleteErr(
        this.#adapter.platform,
        'anonId',
        err.message
      );
    }
  }

  async getDebug(): Promise<string | null> {
    try {
      return await this.#adapter.getItem('DEBUG');
    } catch (err) {
      throw new StorageGetErr(
        this.#adapter.platform,
        'DEBUG',
        err.message
      );
    }
  }
}
