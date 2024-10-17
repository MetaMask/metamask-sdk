import {
  createRpcWarningMiddleware
} from "./chunk-5FL6VRJJ.mjs";

// src/utils.ts
import { createIdRemapMiddleware } from "@metamask/json-rpc-engine";
import { rpcErrors } from "@metamask/rpc-errors";
var EMITTED_NOTIFICATIONS = Object.freeze([
  "eth_subscription"
  // per eth-json-rpc-filters/subscriptionManager
]);
var getDefaultExternalMiddleware = (logger = console) => [
  createIdRemapMiddleware(),
  createErrorMiddleware(logger),
  createRpcWarningMiddleware(logger)
];
function createErrorMiddleware(log) {
  return (request, response, next) => {
    if (typeof request.method !== "string" || !request.method) {
      response.error = rpcErrors.invalidRequest({
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

export {
  EMITTED_NOTIFICATIONS,
  getDefaultExternalMiddleware,
  getRpcPromiseCallback,
  isValidChainId,
  isValidNetworkVersion,
  NOOP
};
//# sourceMappingURL=chunk-ZN7WV55J.mjs.map