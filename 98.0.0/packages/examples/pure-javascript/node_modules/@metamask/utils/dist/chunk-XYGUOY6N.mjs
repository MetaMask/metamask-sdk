import {
  isNullOrUndefined,
  isObject
} from "./chunk-H4YFDLB7.mjs";

// src/errors.ts
import { ErrorWithCause } from "pony-cause";
function isError(error) {
  return error instanceof Error || isObject(error) && error.constructor.name === "Error";
}
function isErrorWithCode(error) {
  return typeof error === "object" && error !== null && "code" in error;
}
function isErrorWithMessage(error) {
  return typeof error === "object" && error !== null && "message" in error;
}
function isErrorWithStack(error) {
  return typeof error === "object" && error !== null && "stack" in error;
}
function getErrorMessage(error) {
  if (isErrorWithMessage(error) && typeof error.message === "string") {
    return error.message;
  }
  if (isNullOrUndefined(error)) {
    return "";
  }
  return String(error);
}
function wrapError(originalError, message) {
  if (isError(originalError)) {
    let error;
    if (Error.length === 2) {
      error = new Error(message, { cause: originalError });
    } else {
      error = new ErrorWithCause(message, { cause: originalError });
    }
    if (isErrorWithCode(originalError)) {
      error.code = originalError.code;
    }
    return error;
  }
  if (message.length > 0) {
    return new Error(`${String(originalError)}: ${message}`);
  }
  return new Error(String(originalError));
}

export {
  isErrorWithCode,
  isErrorWithMessage,
  isErrorWithStack,
  getErrorMessage,
  wrapError
};
//# sourceMappingURL=chunk-XYGUOY6N.mjs.map