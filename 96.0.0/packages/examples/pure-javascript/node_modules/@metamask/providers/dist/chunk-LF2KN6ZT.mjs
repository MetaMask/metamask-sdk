import {
  shimWeb3
} from "./chunk-F2Z5ZMH3.mjs";
import {
  announceProvider
} from "./chunk-ZUJYX37P.mjs";
import {
  MetaMaskInpageProvider
} from "./chunk-URMSZO7Z.mjs";

// src/initializeInpageProvider.ts
function initializeProvider({
  connectionStream,
  jsonRpcStreamName,
  logger = console,
  maxEventListeners = 100,
  providerInfo,
  shouldSendMetadata = true,
  shouldSetOnWindow = true,
  shouldShimWeb3 = false
}) {
  const provider = new MetaMaskInpageProvider(connectionStream, {
    jsonRpcStreamName,
    logger,
    maxEventListeners,
    shouldSendMetadata
  });
  const proxiedProvider = new Proxy(provider, {
    // some common libraries, e.g. web3@1.x, mess with our API
    deleteProperty: () => true,
    // fix issue with Proxy unable to access private variables from getters
    // https://stackoverflow.com/a/73051482
    get(target, propName) {
      return target[propName];
    }
  });
  if (providerInfo) {
    announceProvider({
      info: providerInfo,
      provider: proxiedProvider
    });
  }
  if (shouldSetOnWindow) {
    setGlobalProvider(proxiedProvider);
  }
  if (shouldShimWeb3) {
    shimWeb3(proxiedProvider, logger);
  }
  return proxiedProvider;
}
function setGlobalProvider(providerInstance) {
  window.ethereum = providerInstance;
  window.dispatchEvent(new Event("ethereum#initialized"));
}

export {
  initializeProvider,
  setGlobalProvider
};
//# sourceMappingURL=chunk-LF2KN6ZT.mjs.map