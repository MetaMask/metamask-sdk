"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }


var _chunk77LIU62Ijs = require('./chunk-77LIU62I.js');


var _chunkLIUXO4DWjs = require('./chunk-LIUXO4DW.js');


var _chunkFBHPY3A4js = require('./chunk-FBHPY3A4.js');

// src/errors.ts
var rpcErrors = {
  /**
   * Get a JSON RPC 2.0 Parse (-32700) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  parse: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.parse, arg),
  /**
   * Get a JSON RPC 2.0 Invalid Request (-32600) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  invalidRequest: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.invalidRequest, arg),
  /**
   * Get a JSON RPC 2.0 Invalid Params (-32602) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  invalidParams: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.invalidParams, arg),
  /**
   * Get a JSON RPC 2.0 Method Not Found (-32601) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  methodNotFound: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.methodNotFound, arg),
  /**
   * Get a JSON RPC 2.0 Internal (-32603) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  internal: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.internal, arg),
  /**
   * Get a JSON RPC 2.0 Server error.
   * Permits integer error codes in the [ -32099 <= -32005 ] range.
   * Codes -32000 through -32004 are reserved by EIP-1474.
   *
   * @param opts - The error options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  server: (opts) => {
    if (!opts || typeof opts !== "object" || Array.isArray(opts)) {
      throw new Error(
        "Ethereum RPC Server errors must provide single object argument."
      );
    }
    const { code } = opts;
    if (!Number.isInteger(code) || code > -32005 || code < -32099) {
      throw new Error(
        '"code" must be an integer such that: -32099 <= code <= -32005'
      );
    }
    return getJsonRpcError(code, opts);
  },
  /**
   * Get an Ethereum JSON RPC Invalid Input (-32000) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  invalidInput: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.invalidInput, arg),
  /**
   * Get an Ethereum JSON RPC Resource Not Found (-32001) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  resourceNotFound: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.resourceNotFound, arg),
  /**
   * Get an Ethereum JSON RPC Resource Unavailable (-32002) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  resourceUnavailable: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.resourceUnavailable, arg),
  /**
   * Get an Ethereum JSON RPC Transaction Rejected (-32003) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  transactionRejected: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.transactionRejected, arg),
  /**
   * Get an Ethereum JSON RPC Method Not Supported (-32004) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  methodNotSupported: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.methodNotSupported, arg),
  /**
   * Get an Ethereum JSON RPC Limit Exceeded (-32005) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link JsonRpcError} class.
   */
  limitExceeded: (arg) => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.limitExceeded, arg)
};
var providerErrors = {
  /**
   * Get an Ethereum Provider User Rejected Request (4001) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link EthereumProviderError} class.
   */
  userRejectedRequest: (arg) => {
    return getEthProviderError(_chunkFBHPY3A4js.errorCodes.provider.userRejectedRequest, arg);
  },
  /**
   * Get an Ethereum Provider Unauthorized (4100) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link EthereumProviderError} class.
   */
  unauthorized: (arg) => {
    return getEthProviderError(_chunkFBHPY3A4js.errorCodes.provider.unauthorized, arg);
  },
  /**
   * Get an Ethereum Provider Unsupported Method (4200) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link EthereumProviderError} class.
   */
  unsupportedMethod: (arg) => {
    return getEthProviderError(_chunkFBHPY3A4js.errorCodes.provider.unsupportedMethod, arg);
  },
  /**
   * Get an Ethereum Provider Not Connected (4900) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link EthereumProviderError} class.
   */
  disconnected: (arg) => {
    return getEthProviderError(_chunkFBHPY3A4js.errorCodes.provider.disconnected, arg);
  },
  /**
   * Get an Ethereum Provider Chain Not Connected (4901) error.
   *
   * @param arg - The error message or options bag.
   * @returns An instance of the {@link EthereumProviderError} class.
   */
  chainDisconnected: (arg) => {
    return getEthProviderError(_chunkFBHPY3A4js.errorCodes.provider.chainDisconnected, arg);
  },
  /**
   * Get a custom Ethereum Provider error.
   *
   * @param opts - The error options bag.
   * @returns An instance of the {@link EthereumProviderError} class.
   */
  custom: (opts) => {
    if (!opts || typeof opts !== "object" || Array.isArray(opts)) {
      throw new Error(
        "Ethereum Provider custom errors must provide single object argument."
      );
    }
    const { code, message, data } = opts;
    if (!message || typeof message !== "string") {
      throw new Error('"message" must be a nonempty string');
    }
    return new (0, _chunk77LIU62Ijs.EthereumProviderError)(code, message, data);
  }
};
function getJsonRpcError(code, arg) {
  const [message, data] = parseOpts(arg);
  return new (0, _chunk77LIU62Ijs.JsonRpcError)(code, _nullishCoalesce(message, () => ( _chunkLIUXO4DWjs.getMessageFromCode.call(void 0, code))), data);
}
function getEthProviderError(code, arg) {
  const [message, data] = parseOpts(arg);
  return new (0, _chunk77LIU62Ijs.EthereumProviderError)(
    code,
    _nullishCoalesce(message, () => ( _chunkLIUXO4DWjs.getMessageFromCode.call(void 0, code))),
    data
  );
}
function parseOpts(arg) {
  if (arg) {
    if (typeof arg === "string") {
      return [arg];
    } else if (typeof arg === "object" && !Array.isArray(arg)) {
      const { message, data } = arg;
      if (message && typeof message !== "string") {
        throw new Error("Must specify string message.");
      }
      return [_nullishCoalesce(message, () => ( void 0)), data];
    }
  }
  return [];
}




exports.rpcErrors = rpcErrors; exports.providerErrors = providerErrors;
//# sourceMappingURL=chunk-I3KUC4QQ.js.map