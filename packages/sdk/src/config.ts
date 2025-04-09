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

export const lcAnalyticsRPCs = Object.keys(METHODS_TO_REDIRECT)
  .filter((method) => METHODS_TO_REDIRECT[method] === true)
  .map((method) => method.toLowerCase());

// unsupported extension connectWith methods
export const rpcWithAccountParam = [
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'eth_sign',
].map((method) => method.toLowerCase());

export const STORAGE_PATH = '.sdk-comm';
export const STORAGE_PROVIDER_TYPE = 'providerType';
export const STORAGE_DAPP_SELECTED_ADDRESS = '.MMSDK_cached_address';
export const STORAGE_DAPP_CHAINID = '.MMSDK_cached_chainId';

export const EXTENSION_EVENTS = {
  CHAIN_CHANGED: 'chainChanged',
  ACCOUNTS_CHANGED: 'accountsChanged',
  DISCONNECT: 'disconnect',
  CONNECT: 'connect',
  CONNECTED: 'connected',
};

export const MAX_MESSAGE_LENGTH = 1_000_000; // 1MB limit
