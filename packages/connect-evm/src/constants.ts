export const IGNORED_METHODS = [
  'metamask_getProviderState',
  'metamask_sendDomainMetadata',
  'metamask_logWeb3ShimUsage',
  'wallet_registerOnboarding',
  'net_version',
  'wallet_getPermissions',
];

export const CONNECT_METHODS = [
  'wallet_requestPermissions',
  'eth_requestAccounts',
  'eth_accounts',
  'eth_coinbase',
];

export const DISTINCT_METHODS = [
  'wallet_revokePermissions',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
];

export const INTERCEPTABLE_METHODS = [
  ...IGNORED_METHODS,
  ...CONNECT_METHODS,
  ...DISTINCT_METHODS,
];
