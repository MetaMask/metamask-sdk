"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkDD6YP3BVjs = require('./chunk-DD6YP3BV.js');


var _chunkWBB62AKCjs = require('./chunk-WBB62AKC.js');


var _chunkHP7EYLLYjs = require('./chunk-HP7EYLLY.js');

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
  const provider = new (0, _chunkHP7EYLLYjs.MetaMaskInpageProvider)(connectionStream, {
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
    _chunkWBB62AKCjs.announceProvider.call(void 0, {
      info: providerInfo,
      provider: proxiedProvider
    });
  }
  if (shouldSetOnWindow) {
    setGlobalProvider(proxiedProvider);
  }
  if (shouldShimWeb3) {
    _chunkDD6YP3BVjs.shimWeb3.call(void 0, proxiedProvider, logger);
  }
  return proxiedProvider;
}
function setGlobalProvider(providerInstance) {
  window.ethereum = providerInstance;
  window.dispatchEvent(new Event("ethereum#initialized"));
}




exports.initializeProvider = initializeProvider; exports.setGlobalProvider = setGlobalProvider;
//# sourceMappingURL=chunk-IZY7ABOL.js.map