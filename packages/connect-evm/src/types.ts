// Basic types redefined to avoid importing @metamask/utils due to Buffer dependency
import type { MultichainCore } from '@metamask/multichain-sdk';
import type { EIP1193Provider } from './provider';

export type Hex = `0x${string}`;
export type Address = Hex;
export type CaipAccountId = `${string}:${string}:${string}`;

export type MinimalEventEmitter = Pick<EIP1193Provider, 'on' | 'off' | 'emit'>;

export type EIP1193ProviderEvents = {
  connect: [{ chainId?: number }];
  disconnect: [];
  accountsChanged: [{ account: string }];
  chainChanged: [{ chainId: number }];
};

export type EventHandlers = {
  accountsChanged: (accounts: Address[]) => void;
  chainChanged: (chainId: string) => void;
  connect: (result: { accounts: Address[]; chainId?: number }) => void;
  disconnect: () => void;
};

export type MetamaskConnectEVMOptions = {
  core: MultichainCore;
  eventEmitter?: MinimalEventEmitter;
  eventHandlers?: EventHandlers;
};

export type AddEthereumChainParameter = {
  chainId?: string;
  chainName?: string;
  nativeCurrency?: {
    name?: string;
    symbol?: string;
    decimals?: number;
  };
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
};

// Specific provider request types
type ConnectRequest = {
  method:
    | 'wallet_requestPermissions'
    | 'eth_requestAccounts'
    | 'eth_accounts'
    | 'eth_coinbase';
  params: [chainId?: number, account?: string];
  chainId?: string;
};

type RevokePermissionsRequest = {
  method: 'wallet_revokePermissions';
  params: unknown[];
  chainId?: string;
};

type SwitchEthereumChainRequest = {
  method: 'wallet_switchEthereumChain';
  params: [{ chainId: string }];
  chainId?: string;
};

type AddEthereumChainRequest = {
  method: 'wallet_addEthereumChain';
  params: [AddEthereumChainParameter];
  chainId?: string;
};

type GenericProviderRequest = {
  method: Exclude<
    string,
    | 'wallet_requestPermissions'
    | 'eth_requestAccounts'
    | 'eth_accounts'
    | 'eth_coinbase'
    | 'wallet_revokePermissions'
    | 'wallet_switchEthereumChain'
    | 'wallet_addEthereumChain'
  >;
  params: unknown;
  chainId?: string;
};

// Discriminated union for provider requests
export type ProviderRequest =
  | ConnectRequest
  | RevokePermissionsRequest
  | SwitchEthereumChainRequest
  | AddEthereumChainRequest
  | GenericProviderRequest;

export type ProviderRequestInterceptor = (
  req: ProviderRequest,
) => Promise<unknown>;
