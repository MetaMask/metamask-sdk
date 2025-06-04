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
  const { StoreAdapterWeb } = await import('./store/adapters/web');
  const adapter = new StoreAdapterWeb(storage);
  return MultichainSDK.create({
    ...options,
    storage: adapter,
  });
}
