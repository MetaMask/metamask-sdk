import { ProviderRequest } from '../types';

/**
 * Type guard for connect-like requests:
 * - wallet_requestPermissions
 * - eth_requestAccounts
 * - eth_accounts
 * - eth_coinbase
 */
export function isConnectRequest(req: ProviderRequest): req is Extract<
  ProviderRequest,
  {
    method:
      | 'wallet_requestPermissions'
      | 'eth_requestAccounts'
      | 'eth_accounts'
      | 'eth_coinbase';
  }
> {
  return (
    req.method === 'wallet_requestPermissions' ||
    req.method === 'eth_requestAccounts' ||
    req.method === 'eth_accounts' ||
    req.method === 'eth_coinbase'
  );
}

/**
 * Type guard for wallet_switchEthereumChain request.
 */
export function isSwitchChainRequest(
  req: ProviderRequest,
): req is Extract<ProviderRequest, { method: 'wallet_switchEthereumChain' }> {
  return req.method === 'wallet_switchEthereumChain';
}

/**
 * Type guard for wallet_addEthereumChain request.
 */
export function isAddChainRequest(
  req: ProviderRequest,
): req is Extract<ProviderRequest, { method: 'wallet_addEthereumChain' }> {
  return req.method === 'wallet_addEthereumChain';
}
