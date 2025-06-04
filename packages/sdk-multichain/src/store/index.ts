import type { StoreAdapter, StoreClient } from '../domain';

export class Store implements StoreClient {
  readonly #adapter: StoreAdapter;

  constructor(adapter: StoreAdapter) {
    this.#adapter = adapter;
  }

  async getAnonId(): Promise<string> {
    throw new Error('Not implemented');
  }
}
