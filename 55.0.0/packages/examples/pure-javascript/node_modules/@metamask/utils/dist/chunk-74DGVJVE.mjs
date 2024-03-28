import {
  getErrorMessage
} from "./chunk-XYGUOY6N.mjs";

// src/assert.ts
import { assert as assertSuperstruct } from "superstruct";
function isConstructable(fn) {
  return Boolean(typeof fn?.prototype?.constructor?.name === "string");
}
function getErrorMessageWithoutTrailingPeriod(error) {
  return getErrorMessage(error).replace(/\.$/u, "");
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
    assertSuperstruct(value, struct);
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

export {
  AssertionError,
  assert,
  assertStruct,
  assertExhaustive
};
//# sourceMappingURL=chunk-74DGVJVE.mjs.map