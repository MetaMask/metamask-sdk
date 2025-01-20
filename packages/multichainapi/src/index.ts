// packages/multichainapi/src/index.ts

import { MetamaskMultichain } from './MetamaskMultichain';

// This is the main "entry point" for the package.
export * from './MetamaskMultichain';

export function createMultichainAPI() {
  const provider = new MetamaskMultichain();
  return provider;
}

// Re-export any constants or utilities that might be helpful:
export * from './constants/networks';
export * from './constants/methods';
export * from './walletDiscovery';
export * from './initialization';
export * from './storage';
export * from './utils/getCaip25FormattedAddresses';
export * from './utils/JsonHelpers';
export * from './types';
export * from './providers/BaseProvider';
