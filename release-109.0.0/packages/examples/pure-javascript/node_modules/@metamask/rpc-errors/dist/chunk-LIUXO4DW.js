"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkFBHPY3A4js = require('./chunk-FBHPY3A4.js');

// src/utils.ts





var _utils = require('@metamask/utils');
var FALLBACK_ERROR_CODE = _chunkFBHPY3A4js.errorCodes.rpc.internal;
var FALLBACK_MESSAGE = "Unspecified error message. This is a bug, please report it.";
var FALLBACK_ERROR = {
  code: FALLBACK_ERROR_CODE,
  message: getMessageFromCode(FALLBACK_ERROR_CODE)
};
var JSON_RPC_SERVER_ERROR_MESSAGE = "Unspecified server error.";
function getMessageFromCode(code, fallbackMessage = FALLBACK_MESSAGE) {
  if (isValidCode(code)) {
    const codeString = code.toString();
    if (_utils.hasProperty.call(void 0, _chunkFBHPY3A4js.errorValues, codeString)) {
      return _chunkFBHPY3A4js.errorValues[codeString].message;
    }
    if (isJsonRpcServerError(code)) {
      return JSON_RPC_SERVER_ERROR_MESSAGE;
    }
  }
  return fallbackMessage;
}
function isValidCode(code) {
  return Number.isInteger(code);
}
function serializeError(error, { fallbackError = FALLBACK_ERROR, shouldIncludeStack = true } = {}) {
  if (!_utils.isJsonRpcError.call(void 0, fallbackError)) {
    throw new Error(
      "Must provide fallback error with integer number code and string message."
    );
  }
  const serialized = buildError(error, fallbackError);
  if (!shouldIncludeStack) {
    delete serialized.stack;
  }
  return serialized;
}
function buildError(error, fallbackError) {
  if (error && typeof error === "object" && "serialize" in error && typeof error.serialize === "function") {
    return error.serialize();
  }
  if (_utils.isJsonRpcError.call(void 0, error)) {
    return error;
  }
  const cause = serializeCause(error);
  const fallbackWithCause = {
    ...fallbackError,
    data: { cause }
  };
  return fallbackWithCause;
}
function isJsonRpcServerError(code) {
  return code >= -32099 && code <= -32e3;
}
function serializeCause(error) {
  if (Array.isArray(error)) {
    return error.map((entry) => {
      if (_utils.isValidJson.call(void 0, entry)) {
        return entry;
      } else if (_utils.isObject.call(void 0, entry)) {
        return serializeObject(entry);
      }
      return null;
    });
  } else if (_utils.isObject.call(void 0, error)) {
    return serializeObject(error);
  }
  if (_utils.isValidJson.call(void 0, error)) {
    return error;
  }
  return null;
}
function serializeObject(object) {
  return Object.getOwnPropertyNames(object).reduce(
    (acc, key) => {
      const value = object[key];
      if (_utils.isValidJson.call(void 0, value)) {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );
}







exports.JSON_RPC_SERVER_ERROR_MESSAGE = JSON_RPC_SERVER_ERROR_MESSAGE; exports.getMessageFromCode = getMessageFromCode; exports.isValidCode = isValidCode; exports.serializeError = serializeError; exports.serializeCause = serializeCause;
//# sourceMappingURL=chunk-LIUXO4DW.js.map