import {
  serializeCause
} from "./chunk-MPU3CVX3.mjs";

// src/classes.ts
import { isPlainObject } from "@metamask/utils";
import safeStringify from "fast-safe-stringify";
var JsonRpcError = class extends Error {
  constructor(code, message, data) {
    if (!Number.isInteger(code)) {
      throw new Error('"code" must be an integer.');
    }
    if (!message || typeof message !== "string") {
      throw new Error('"message" must be a non-empty string.');
    }
    super(message);
    this.code = code;
    if (data !== void 0) {
      this.data = data;
    }
  }
  /**
   * Get the error as JSON-serializable object.
   *
   * @returns A plain object with all public class properties.
   */
  serialize() {
    const serialized = {
      code: this.code,
      message: this.message
    };
    if (this.data !== void 0) {
      serialized.data = this.data;
      if (isPlainObject(this.data)) {
        serialized.data.cause = serializeCause(this.data.cause);
      }
    }
    if (this.stack) {
      serialized.stack = this.stack;
    }
    return serialized;
  }
  /**
   * Get a string representation of the serialized error, omitting any circular
   * references.
   *
   * @returns A string representation of the serialized error.
   */
  toString() {
    return safeStringify(this.serialize(), stringifyReplacer, 2);
  }
};
var EthereumProviderError = class extends JsonRpcError {
  /**
   * Create an Ethereum Provider JSON-RPC error.
   *
   * @param code - The JSON-RPC error code. Must be an integer in the
   * `1000 <= n <= 4999` range.
   * @param message - The JSON-RPC error message.
   * @param data - Optional data to include in the error.
   */
  constructor(code, message, data) {
    if (!isValidEthProviderCode(code)) {
      throw new Error(
        '"code" must be an integer such that: 1000 <= code <= 4999'
      );
    }
    super(code, message, data);
  }
};
function isValidEthProviderCode(code) {
  return Number.isInteger(code) && code >= 1e3 && code <= 4999;
}
function stringifyReplacer(_, value) {
  if (value === "[Circular]") {
    return void 0;
  }
  return value;
}

export {
  JsonRpcError,
  EthereumProviderError
};
//# sourceMappingURL=chunk-XSKO3GXZ.mjs.map