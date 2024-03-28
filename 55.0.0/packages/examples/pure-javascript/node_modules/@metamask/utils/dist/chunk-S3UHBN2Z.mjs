import {
  add0x,
  assertIsHexString
} from "./chunk-VA2DRBDE.mjs";
import {
  assert
} from "./chunk-74DGVJVE.mjs";

// src/number.ts
var numberToHex = (value) => {
  assert(typeof value === "number", "Value must be a number.");
  assert(value >= 0, "Value must be a non-negative number.");
  assert(
    Number.isSafeInteger(value),
    "Value is not a safe integer. Use `bigIntToHex` instead."
  );
  return add0x(value.toString(16));
};
var bigIntToHex = (value) => {
  assert(typeof value === "bigint", "Value must be a bigint.");
  assert(value >= 0, "Value must be a non-negative bigint.");
  return add0x(value.toString(16));
};
var hexToNumber = (value) => {
  assertIsHexString(value);
  const numberValue = parseInt(value, 16);
  assert(
    Number.isSafeInteger(numberValue),
    "Value is not a safe integer. Use `hexToBigInt` instead."
  );
  return numberValue;
};
var hexToBigInt = (value) => {
  assertIsHexString(value);
  return BigInt(add0x(value));
};

export {
  numberToHex,
  bigIntToHex,
  hexToNumber,
  hexToBigInt
};
//# sourceMappingURL=chunk-S3UHBN2Z.mjs.map