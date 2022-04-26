export enum CommunicationLayerPreference {
  WEBRTC = 'webrtc',
  SOCKET = 'socket',
  WALLETCONNECT = 'wc'
}

export enum ProviderConstants {
  INPAGE = 'metamask-inpage',
  CONTENT_SCRIPT = 'metamask-contentscript',
  PROVIDER = 'metamask-provider',
}

export const METHODS_TO_REDIRECT = {
  eth_requestAccounts: true,
  eth_sendTransaction: true,
  eth_signTransaction: true,
  eth_sign: true,
  personal_sign: true,
  eth_signTypedData: true,
  eth_signTypedData_v3: true,
  eth_signTypedData_v4: true,
  wallet_watchAsset: true,
  wallet_addEthereumChain: true,
  wallet_switchEthereumChain: true,
};