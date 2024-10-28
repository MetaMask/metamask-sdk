import {
  errorCodes,
  errorValues
} from "./chunk-MIW4NMY6.mjs";

// src/utils.ts
import {
  hasProperty,
  isValidJson,
  isObject,
  isJsonRpcError
} from "@metamask/utils";
var FALLBACK_ERROR_CODE = errorCodes.rpc.internal;
var FALLBACK_MESSAGE = "Unspecified error message. This is a bug, please report it.";
var FALLBACK_ERROR = {
  code: FALLBACK_ERROR_CODE,
  message: getMessageFromCode(FALLBACK_ERROR_CODE)
};
var JSON_RPC_SERVER_ERROR_MESSAGE = "Unspecified server error.";
function getMessageFromCode(code, fallbackMessage = FALLBACK_MESSAGE) {
  if (isValidCode(code)) {
    const codeString = code.toString();
    if (hasProperty(errorValues, codeString)) {
      return errorValues[codeString].message;
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
  if (!isJsonRpcError(fallbackError)) {
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
  if (isJsonRpcError(error)) {
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
      if (isValidJson(entry)) {
        return entry;
      } else if (isObject(entry)) {
        return serializeObject(entry);
      }
      return null;
    });
  } else if (isObject(error)) {
    return serializeObject(error);
  }
  if (isValidJson(error)) {
    return error;
  }
  return null;
}
function serializeObject(object) {
  return Object.getOwnPropertyNames(object).reduce(
    (acc, key) => {
      const value = object[key];
      if (isValidJson(value)) {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );
}

export {
  JSON_RPC_SERVER_ERROR_MESSAGE,
  getMessageFromCode,
  isValidCode,
  serializeError,
  serializeCause
};
//# sourceMappingURL=chunk-MPU3CVX3.mjs.map