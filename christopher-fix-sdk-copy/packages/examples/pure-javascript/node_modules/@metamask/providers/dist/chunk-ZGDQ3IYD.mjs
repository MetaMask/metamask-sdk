// src/messages.ts
var messages = {
  errors: {
    disconnected: () => "MetaMask: Disconnected from chain. Attempting to connect.",
    permanentlyDisconnected: () => "MetaMask: Disconnected from MetaMask background. Page reload required.",
    sendSiteMetadata: () => `MetaMask: Failed to send site metadata. This is an internal error, please report this bug.`,
    unsupportedSync: (method) => `MetaMask: The MetaMask Ethereum provider does not support synchronous methods like ${method} without a callback parameter.`,
    invalidDuplexStream: () => "Must provide a Node.js-style duplex stream.",
    invalidNetworkParams: () => "MetaMask: Received invalid network parameters. Please report this bug.",
    invalidRequestArgs: () => `Expected a single, non-array, object argument.`,
    invalidRequestMethod: () => `'args.method' must be a non-empty string.`,
    invalidRequestParams: () => `'args.params' must be an object or array if provided.`,
    invalidLoggerObject: () => `'args.logger' must be an object if provided.`,
    invalidLoggerMethod: (method) => `'args.logger' must include required method '${method}'.`
  },
  info: {
    connected: (chainId) => `MetaMask: Connected to chain with ID "${chainId}".`
  },
  warnings: {
    // deprecated properties
    chainIdDeprecation: `MetaMask: 'ethereum.chainId' is deprecated and may be removed in the future. Please use the 'eth_chainId' RPC method instead.
For more information, see: https://github.com/MetaMask/metamask-improvement-proposals/discussions/23`,
    networkVersionDeprecation: `MetaMask: 'ethereum.networkVersion' is deprecated and may be removed in the future. Please use the 'net_version' RPC method instead.
For more information, see: https://github.com/MetaMask/metamask-improvement-proposals/discussions/23`,
    selectedAddressDeprecation: `MetaMask: 'ethereum.selectedAddress' is deprecated and may be removed in the future. Please use the 'eth_accounts' RPC method instead.
For more information, see: https://github.com/MetaMask/metamask-improvement-proposals/discussions/23`,
    // deprecated methods
    enableDeprecation: `MetaMask: 'ethereum.enable()' is deprecated and may be removed in the future. Please use the 'eth_requestAccounts' RPC method instead.
For more information, see: https://eips.ethereum.org/EIPS/eip-1102`,
    sendDeprecation: `MetaMask: 'ethereum.send(...)' is deprecated and may be removed in the future. Please use 'ethereum.sendAsync(...)' or 'ethereum.request(...)' instead.
For more information, see: https://eips.ethereum.org/EIPS/eip-1193`,
    // deprecated events
    events: {
      close: `MetaMask: The event 'close' is deprecated and may be removed in the future. Please use 'disconnect' instead.
For more information, see: https://eips.ethereum.org/EIPS/eip-1193#disconnect`,
      data: `MetaMask: The event 'data' is deprecated and will be removed in the future. Use 'message' instead.
For more information, see: https://eips.ethereum.org/EIPS/eip-1193#message`,
      networkChanged: `MetaMask: The event 'networkChanged' is deprecated and may be removed in the future. Use 'chainChanged' instead.
For more information, see: https://eips.ethereum.org/EIPS/eip-1193#chainchanged`,
      notification: `MetaMask: The event 'notification' is deprecated and may be removed in the future. Use 'message' instead.
For more information, see: https://eips.ethereum.org/EIPS/eip-1193#message`
    },
    rpc: {
      ethDecryptDeprecation: `MetaMask: The RPC method 'eth_decrypt' is deprecated and may be removed in the future.
For more information, see: https://medium.com/metamask/metamask-api-method-deprecation-2b0564a84686`,
      ethGetEncryptionPublicKeyDeprecation: `MetaMask: The RPC method 'eth_getEncryptionPublicKey' is deprecated and may be removed in the future.
For more information, see: https://medium.com/metamask/metamask-api-method-deprecation-2b0564a84686`,
      walletWatchAssetNFTExperimental: `MetaMask: The RPC method 'wallet_watchAsset' is experimental for ERC721/ERC1155 assets and may change in the future.
For more information, see: https://github.com/MetaMask/metamask-improvement-proposals/blob/main/MIPs/mip-1.md and https://github.com/MetaMask/metamask-improvement-proposals/blob/main/PROCESS-GUIDE.md#proposal-lifecycle`
    },
    // misc
    experimentalMethods: `MetaMask: 'ethereum._metamask' exposes non-standard, experimental methods. They may be removed or changed without warning.`
  }
};
var messages_default = messages;

export {
  messages_default
};
//# sourceMappingURL=chunk-ZGDQ3IYD.mjs.map