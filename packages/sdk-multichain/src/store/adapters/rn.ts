import { StoreAdapter } from "../../domain/store/adapter";

export class StoreAdapterRN extends StoreAdapter {
  async getItem(key: string): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  async setItem(key: string, value: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async deleteItem(key: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
