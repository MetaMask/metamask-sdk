import type {
  SessionData,
} from '@metamask/multichain-api-client';
import type { CaipAccountId, CaipChainId, Hex, Json } from '@metamask/utils';

import type EIP155 from './api/eip155';
import type { StoreClient } from '../store/client';

export type RPCAPI = {
  eip155: EIP155;
};

export type Notification = {
  method: string;
  params?: Json;
  jsonrpc?: string;
};

export type NotificationCallback = (notification: unknown) => void;

// Type for invoke method options that accepts any valid scope/method combination
export type InvokeMethodOptions = {
  scope: Scope<RPCAPI>;
  request: {
    method: string;
    params: unknown;
  };
};

export abstract class MultichainSDKBase {
  abstract connect(options?: { extensionId?: string }): Promise<boolean>;

  abstract disconnect(): Promise<void>;

  abstract getSession(): Promise<SessionData | undefined>;

  abstract createSession(  scopes: Scope[], caipAccountIds: CaipAccountId[] ): Promise<SessionData>;

  abstract revokeSession(): Promise<void>;

  abstract onNotification(listener: NotificationCallback): () => void;

  abstract invokeMethod(options: InvokeMethodOptions): Promise<Json>;

  abstract readonly storage: StoreClient;
}


export type DappSettings = { name?: string; url?: string, iconUrl?: string } |
{ name?: string; url?: string, base64Icon?: string }

export interface RPC_URLS_MAP {
  [chainId: CaipChainId]: string; // CAIP-2 format: namespace:reference (e.g., "eip155:1", "starknet:SN_MAIN")
}

export type MultichainSDKConstructor = {
  dapp: DappSettings;
  api?: {
     /**
     * The Infura API key to use for RPC requests.
     */
    infuraAPIKey?: string;

    /**
     * A map of RPC URLs to use for read-only requests.
     */
    readonlyRPCMap?: RPC_URLS_MAP;
  }
  analytics: { enabled: false } | { enabled: true; integrationType: string };
  storage: StoreClient;
  ui: { headless: boolean };
  transport?: {
    extensionId?: string;
  };
};

export type { SessionData } from '@metamask/multichain-api-client';

export type Scope<T extends RPCAPI = RPCAPI> =
  | `eip155:${string}`
  | `solana:${string}`
  | `${Extract<keyof T, string>}:${string}`;

export type MultichainSDKBaseOptions = Pick<MultichainSDKConstructor, 'dapp' | 'analytics' | 'ui' | 'transport'>;


export type MultichainSDKOptions = MultichainSDKBaseOptions & {
  storage: StoreClient;
};

export const RPC_METHODS = {
  METAMASK_GETPROVIDERSTATE: 'metamask_getProviderState',
  METAMASK_CONNECTSIGN: 'metamask_connectSign',
  METAMASK_CONNECTWITH: 'metamask_connectWith',
  METAMASK_OPEN: 'metamask_open',
  METAMASK_BATCH: 'metamask_batch',
  PERSONAL_SIGN: 'personal_sign',
  WALLET_REQUESTPERMISSIONS: 'wallet_requestPermissions',
  WALLET_REVOKEPERMISSIONS: 'wallet_revokePermissions',
  WALLET_GETPERMISSIONS: 'wallet_getPermissions',
  WALLET_WATCHASSET: 'wallet_watchAsset',
  WALLET_ADDETHEREUMCHAIN: 'wallet_addEthereumChain',
  WALLET_SWITCHETHETHEREUMCHAIN: 'wallet_switchEthereumChain',
  ETH_REQUESTACCOUNTS: 'eth_requestAccounts',
  ETH_ACCOUNTS: 'eth_accounts',
  ETH_CHAINID: 'eth_chainId',
  ETH_SENDTRANSACTION: 'eth_sendTransaction',
  ETH_SIGNTYPEDDATA: 'eth_signTypedData',
  ETH_SIGNTYPEDDATA_V3: 'eth_signTypedData_v3',
  ETH_SIGNTYPEDDATA_V4: 'eth_signTypedData_v4',
  ETH_SIGNTRANSACTION: 'eth_signTransaction',
  ETH_SIGN: 'eth_sign',
  PERSONAL_EC_RECOVER: 'personal_ecRecover',
};

export const METHODS_TO_REDIRECT: { [method: string]: boolean } = {
  [RPC_METHODS.ETH_REQUESTACCOUNTS]: true,
  [RPC_METHODS.ETH_SENDTRANSACTION]: true,
  [RPC_METHODS.ETH_SIGNTRANSACTION]: true,
  [RPC_METHODS.ETH_SIGN]: true,
  [RPC_METHODS.PERSONAL_SIGN]: true,
  // stop redirecting these as we are caching values in the provider
  [RPC_METHODS.ETH_ACCOUNTS]: false,
  [RPC_METHODS.ETH_CHAINID]: false,
  //
  [RPC_METHODS.PERSONAL_SIGN]: true,
  [RPC_METHODS.ETH_SIGNTYPEDDATA]: true,
  [RPC_METHODS.ETH_SIGNTYPEDDATA_V3]: true,
  [RPC_METHODS.ETH_SIGNTYPEDDATA_V4]: true,
  [RPC_METHODS.WALLET_REQUESTPERMISSIONS]: true,
  [RPC_METHODS.WALLET_GETPERMISSIONS]: true,
  [RPC_METHODS.WALLET_WATCHASSET]: true,
  [RPC_METHODS.WALLET_ADDETHEREUMCHAIN]: true,
  [RPC_METHODS.WALLET_SWITCHETHETHEREUMCHAIN]: true,
  [RPC_METHODS.METAMASK_CONNECTSIGN]: true,
  [RPC_METHODS.METAMASK_CONNECTWITH]: true,
  [RPC_METHODS.PERSONAL_EC_RECOVER]: true,
  [RPC_METHODS.METAMASK_BATCH]: true,
  [RPC_METHODS.METAMASK_OPEN]: true,
};
