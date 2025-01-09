export enum ProviderConstants {
  INPAGE = 'metamask-inpage',
  CONTENT_SCRIPT = 'metamask-contentscript',
  PROVIDER = 'metamask-provider',
}

export const ErrorMessages = {
  MANUAL_DISCONNECT: 'manual-disconnect',
};

export const DEFAULT_SDK_SOURCE = 'direct';

export const METAMASK_CONNECT_BASE_URL = 'https://metamask.app.link/connect';

export const METAMASK_DEEPLINK_BASE = 'metamask://connect';

export const METAMASK_EIP_6369_PROVIDER_INFO = {
  NAME: 'MetaMask',
  RDNS: 'io.metamask.flask',
};

export const UUID_V4_REGEX =
  /(?:^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$)|(?:^0{8}-0{4}-0{4}-0{4}-0{12}$)/u;

export const ONE_MINUTE_IN_MS = 60 * 1000;
export const ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60;
