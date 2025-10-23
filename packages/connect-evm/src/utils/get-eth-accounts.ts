import { SessionData } from '@metamask/multichain-sdk';
import { Address } from '../types';

/**
 *  TODO: Replace with getEthAccounts from @metamask/chain-agnostic-permission once Buffer dependency is removed
 *  Get the Ethereum accounts from the session data
 * @param session - The session data
 * @returns The Ethereum accounts
 */
export const getEthAccounts = (
  sessionScopes: SessionData['sessionScopes'] | undefined,
) => {
  if (!sessionScopes) {
    return [];
  }

  const accounts: Address[] = [];
  Object.entries(sessionScopes).forEach(([scope, scopeData]) => {
    if (scope.startsWith('eip155:')) {
      scopeData.accounts?.forEach((account) => {
        const address = account.split(':').slice(2).join(':') as Address;
        accounts.push(address);
      });
    }
  });
  return accounts;
};
