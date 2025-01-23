// packages/sdk-multichain/src/index.ts

import { MetamaskMultichain, MetamaskMultichainParams } from './MetamaskMultichain';

// This is the main "entry point" for the package.
export * from './MetamaskMultichain';

/**
 * Creates a new MetamaskMultichain instance.
 * @param params - Optional parameters for the MetamaskMultichain instance.
 * @returns A new MetamaskMultichain instance.
 */
export function createMetamaskMultichain(params?: MetamaskMultichainParams) {
  const provider = new MetamaskMultichain(params);
  return provider;
}

// Re-export any constants or utilities that might be helpful:
export * from './helpers/walletDiscovery';
export * from './helpers/initialization';
export * from './helpers/storage';
export * from './utils/getCaip25FormattedAddresses';
export * from './types';
