"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunkIZC266HSjs = require('./chunk-IZC266HS.js');

// src/assert.ts
var _superstruct = require('superstruct');
function isConstructable(fn) {
  return Boolean(typeof _optionalChain([fn, 'optionalAccess', _ => _.prototype, 'optionalAccess', _2 => _2.constructor, 'optionalAccess', _3 => _3.name]) === "string");
}
function getErrorMessageWithoutTrailingPeriod(error) {
  return _chunkIZC266HSjs.getErrorMessage.call(void 0, error).replace(/\.$/u, "");
}
function getError(ErrorWrapper, message) {
  if (isConstructable(ErrorWrapper)) {
    return new ErrorWrapper({
      message
    });
  }
  return ErrorWrapper({
    message
  });
}
var AssertionError = class extends Error {
  constructor(options) {
    super(options.message);
    this.code = "ERR_ASSERTION";
  }
};
function assert(value, message = "Assertion failed.", ErrorWrapper = AssertionError) {
  if (!value) {
    if (message instanceof Error) {
      throw message;
    }
    throw getError(ErrorWrapper, message);
  }
}
function assertStruct(value, struct, errorPrefix = "Assertion failed", ErrorWrapper = AssertionError) {
  try {
    _superstruct.assert.call(void 0, value, struct);
  } catch (error) {
    throw getError(
      ErrorWrapper,
      `${errorPrefix}: ${getErrorMessageWithoutTrailingPeriod(error)}.`
    );
  }
}
function assertExhaustive(_object) {
  throw new Error(
    "Invalid branch reached. Should be detected during compilation."
  );
}






exports.AssertionError = AssertionError; exports.assert = assert; exports.assertStruct = assertStruct; exports.assertExhaustive = assertExhaustive;
//# sourceMappingURL=chunk-6ZDHSOUV.js.map