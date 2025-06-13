import type { StoreAdapter } from './adapter';
import type { StoreClient as StoreClientInterface } from './client';

export { StoreAdapter } from './adapter';
export type { StoreOptions } from './adapter';
export { StoreClient } from './client';

export class Store implements StoreClientInterface {
  readonly #adapter: StoreAdapter;

  constructor(adapter: StoreAdapter) {
    this.#adapter = adapter;
  }

  async getAnonId(): Promise<string> {
    throw new Error('Not implemented');
  }
}
