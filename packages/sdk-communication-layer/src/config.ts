export const DEFAULT_SERVER_URL = 'https://metamask-sdk.api.cx.metamask.io/';
export const DEFAULT_SOCKET_TRANSPORTS = ['websocket'];
export const MIN_IN_MS = 1000 * 60;
export const HOUR_IN_MS = MIN_IN_MS * 60;
export const DAY_IN_MS = HOUR_IN_MS * 24;
export const DEFAULT_SESSION_TIMEOUT_MS = 7 * DAY_IN_MS;

// time upon which we wait for a metamask reocnnection before creating a new channel
export const CHANNEL_MAX_WAITING_TIME = 3 * 1000; // 3 seconds

export const MAX_RPC_WAIT_TIME = 5 * 60 * 1000; // 5 minutes

export const RPC_METHODS = {
  METAMASK_GETPROVIDERSTATE: 'metamask_getProviderState',
  ETH_REQUESTACCOUNTS: 'eth_requestAccounts',
};
