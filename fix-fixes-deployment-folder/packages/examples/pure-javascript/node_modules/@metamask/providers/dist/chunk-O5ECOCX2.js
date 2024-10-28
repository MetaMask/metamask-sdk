"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk6QNVTE4Wjs = require('./chunk-6QNVTE4W.js');

// src/utils.ts
var _jsonrpcengine = require('@metamask/json-rpc-engine');
var _rpcerrors = require('@metamask/rpc-errors');
var EMITTED_NOTIFICATIONS = Object.freeze([
  "eth_subscription"
  // per eth-json-rpc-filters/subscriptionManager
]);
var getDefaultExternalMiddleware = (logger = console) => [
  _jsonrpcengine.createIdRemapMiddleware.call(void 0, ),
  createErrorMiddleware(logger),
  _chunk6QNVTE4Wjs.createRpcWarningMiddleware.call(void 0, logger)
];
function createErrorMiddleware(log) {
  return (request, response, next) => {
    if (typeof request.method !== "string" || !request.method) {
      response.error = _rpcerrors.rpcErrors.invalidRequest({
        message: `The request 'method' must be a non-empty string.`,
        data: request
      });
    }
    next((done) => {
      const { error } = response;
      if (!error) {
        return done();
      }
      log.error(`MetaMask - RPC Error: ${error.message}`, error);
      return done();
    });
  };
}
var getRpcPromiseCallback = (resolve, reject, unwrapResult = true) => (error, response) => {
  if (error || response.error) {
    reject(error || response.error);
  } else {
    !unwrapResult || Array.isArray(response) ? resolve(response) : resolve(response.result);
  }
};
var isValidChainId = (chainId) => Boolean(chainId) && typeof chainId === "string" && chainId.startsWith("0x");
var isValidNetworkVersion = (networkVersion) => Boolean(networkVersion) && typeof networkVersion === "string";
var NOOP = () => void 0;








exports.EMITTED_NOTIFICATIONS = EMITTED_NOTIFICATIONS; exports.getDefaultExternalMiddleware = getDefaultExternalMiddleware; exports.getRpcPromiseCallback = getRpcPromiseCallback; exports.isValidChainId = isValidChainId; exports.isValidNetworkVersion = isValidNetworkVersion; exports.NOOP = NOOP;
//# sourceMappingURL=chunk-O5ECOCX2.js.map