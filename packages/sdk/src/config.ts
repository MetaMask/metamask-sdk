export const METHODS_TO_REDIRECT: { [method: string]: boolean } = {
  eth_requestAccounts: true,
  eth_sendTransaction: true,
  eth_signTransaction: true,
  eth_sign: true,
  eth_accounts: true,
  personal_sign: true,
  eth_signTypedData: true,
  eth_signTypedData_v3: true,
  eth_signTypedData_v4: true,
  wallet_requestPermissions: true,
  wallet_getPermissions: true,
  wallet_watchAsset: true,
  wallet_addEthereumChain: true,
  wallet_switchEthereumChain: true,
  metamask_connectSign: true,
  metamask_connectWith: true,
  personal_ecRecover: true,
  metamask_batch: true,
  metamask_open: true,
};
export const STORAGE_PATH = '.sdk-comm';
export const STORAGE_PROVIDER_TYPE = 'providerType';
export const RPC_METHODS = {
  METAMASK_GETPROVIDERSTATE: 'metamask_getProviderState',
  METAMASK_CONNECTSIGN: 'metamask_connectSign',
  METAMASK_CONNECTWITH: 'metamask_connectWith',
  METAMASK_OPEN: 'metamask_open',
  METAMASK_BATCH: 'metamask_batch',
  PERSONAL_SIGN: 'personal_sign',
  WALLET_REQUESTPERMISSIONS: 'wallet_requestPermissions',
  ETH_REQUESTACCOUNTS: 'eth_requestAccounts',
  ETH_ACCOUNTS: 'eth_accounts',
  ETH_CHAINID: 'eth_chainId',
};

export const EXTENSION_EVENTS = {
  CHAIN_CHANGED: 'chainChanged',
  ACCOUNTS_CHANGED: 'accountsChanged',
  DISCONNECT: 'disconnect',
  CONNECT: 'connect',
  CONNECTED: 'connected',
};
