import type { MultichainSDKBaseOptions, StoreOptions } from './domain';
import { MultichainSDK } from './multichain';

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
  const { StoreAdapterNode } = await import('./store/adapters/node');
  const adapter = new StoreAdapterNode(storage);
  return MultichainSDK.create({
    ...options,
    storage: adapter,
  });
}
