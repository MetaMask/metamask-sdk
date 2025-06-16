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
  const { StoreAdapterRN } = await import('./store/adapters/rn');
  const adapter = new StoreAdapterRN(storage);
  return MultichainSDK.create({
    ...options,
    storage: new Store(adapter),
  });
}
