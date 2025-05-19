export const DEFAULT_SERVER_URL = 'https://metamask-sdk.api.cx.metamask.io/';
export const DEFAULT_SOCKET_TRANSPORTS = ['websocket'];
export const MIN_IN_MS = 1000 * 60;
export const HOUR_IN_MS = MIN_IN_MS * 60;
export const DAY_IN_MS = HOUR_IN_MS * 24;
export const DEFAULT_SESSION_TIMEOUT_MS = 7 * DAY_IN_MS;

// time upon which we wait for a metamask reocnnection before creating a new channel
export const CHANNEL_MAX_WAITING_TIME = 3 * 1000; // 3 seconds

export const MAX_RECONNECTION_ATTEMPS = 3;

export const MAX_RPC_WAIT_TIME = 5 * 60 * 1000; // 5 minutes

export const PROTOCOL_VERSION = 2;

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
  WALLET_SWITCHETHEREUMCHAIN: 'wallet_switchEthereumChain',
  WALLET_ADDETHEREUMCHAIN: 'wallet_addEthereumChain',
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

export const RPC_METHODS_TO_TRACK_IN_ANALYTICS = [
  RPC_METHODS.METAMASK_CONNECTSIGN,
  RPC_METHODS.METAMASK_CONNECTWITH,
  RPC_METHODS.METAMASK_OPEN,
  RPC_METHODS.METAMASK_BATCH,
  RPC_METHODS.PERSONAL_SIGN,
  RPC_METHODS.WALLET_REQUESTPERMISSIONS,
  RPC_METHODS.WALLET_REVOKEPERMISSIONS,
  RPC_METHODS.WALLET_WATCHASSET,
  RPC_METHODS.ETH_SENDTRANSACTION,
  RPC_METHODS.ETH_SIGNTYPEDDATA,
  RPC_METHODS.ETH_SIGNTYPEDDATA_V3,
  RPC_METHODS.ETH_SIGNTYPEDDATA_V4,
  RPC_METHODS.ETH_SIGNTRANSACTION,
  RPC_METHODS.ETH_SIGN,
  RPC_METHODS.PERSONAL_EC_RECOVER,
];

export function isAnalyticsTrackedRpcMethod(method: string) {
  return RPC_METHODS_TO_TRACK_IN_ANALYTICS.includes(method);
}
