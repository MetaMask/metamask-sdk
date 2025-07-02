export type StoreOptions = Record<string, any>;

export abstract class StoreAdapter {
  constructor(public options?: StoreOptions) {}

  abstract getItem(key: string): Promise<string | null>;

  abstract setItem(key: string, value: string): Promise<void>;

  abstract deleteItem(key: string): Promise<void>;
}
