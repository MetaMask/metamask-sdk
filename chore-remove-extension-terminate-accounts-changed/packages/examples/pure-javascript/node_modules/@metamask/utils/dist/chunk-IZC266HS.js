"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkQVEKZRZ2js = require('./chunk-QVEKZRZ2.js');

// src/errors.ts
var _ponycause = require('pony-cause');
function isError(error) {
  return error instanceof Error || _chunkQVEKZRZ2js.isObject.call(void 0, error) && error.constructor.name === "Error";
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
  if (_chunkQVEKZRZ2js.isNullOrUndefined.call(void 0, error)) {
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
      error = new (0, _ponycause.ErrorWithCause)(message, { cause: originalError });
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







exports.isErrorWithCode = isErrorWithCode; exports.isErrorWithMessage = isErrorWithMessage; exports.isErrorWithStack = isErrorWithStack; exports.getErrorMessage = getErrorMessage; exports.wrapError = wrapError;
//# sourceMappingURL=chunk-IZC266HS.js.map