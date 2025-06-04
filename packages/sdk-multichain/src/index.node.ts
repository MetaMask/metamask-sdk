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
  const { StoreAdapterNode } = await import('./store/adapters/node');
  const adapter = new StoreAdapterNode(storage);
  return MultichainSDK.create({
    ...options,
    storage: adapter,
  });
}
