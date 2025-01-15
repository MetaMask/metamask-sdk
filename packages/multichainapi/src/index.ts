// packages/multichainapi/src/index.ts

import { MultichainProvider } from './providers/MultichainProvider';

// This is the main "entry point" for the package.
export { MultichainProvider } from './providers/MultichainProvider';
export type { SessionData, MethodParams, SessionEventData } from './types';

// Possibly export some helper function or "createMultichainAPI()" factory here:
export function createMultichainAPI() {
  const provider = new MultichainProvider();
  // Return a simple object with convenience methods, or just the provider itself.
  return provider;
}

// Re-export any constants or utilities that might be helpful:
export * from './constants/networks';
export * from './constants/methods';
export * from './utils/getCaip25FormattedAddresses';
