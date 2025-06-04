import type { StoreOptions } from './domain';
import type { MultichainSDKBaseOptions } from './multichain';
import { MultichainSDK } from './multichain';

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
    storage: adapter,
  });
}
