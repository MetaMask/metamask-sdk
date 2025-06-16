import type { MultichainSDKBaseOptions } from './domain';
import type { StoreOptions } from './domain/store/adapter';
import { MultichainSDK } from './multichain';
import { Store } from './store';

export type * from './domain';

/**
 *
 * @param options0
 * @param options0.storage
 */
export async function createMetamaskSDK({
  storage,
  ...options
}: MultichainSDKBaseOptions & { storage: StoreOptions }) {
  const { StoreAdapterWeb } = await import('./store/adapters/web');
  const adapter = new StoreAdapterWeb(storage);
  return MultichainSDK.create({
    ...options,
    storage: new Store(adapter),
  });
}
