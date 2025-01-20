// packages/sdk-multichain/src/index.ts

import { MetamaskMultichain } from './MetamaskMultichain';

// This is the main "entry point" for the package.
export * from './MetamaskMultichain';

export function createMetamaskMultichain() {
  const provider = new MetamaskMultichain();
  return provider;
}

// Re-export any constants or utilities that might be helpful:
export * from './walletDiscovery';
export * from './initialization';
export * from './storage';
export * from './utils/getCaip25FormattedAddresses';
export * from './types';
