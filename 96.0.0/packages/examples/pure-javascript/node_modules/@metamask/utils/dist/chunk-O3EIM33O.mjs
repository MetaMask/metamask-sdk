import {
  StrictHexStruct,
  bytesToHex,
  hexToBytes
} from "./chunk-VA2DRBDE.mjs";
import {
  assert
} from "./chunk-74DGVJVE.mjs";

// src/coercers.ts
import {
  bigint,
  coerce,
  create,
  instance,
  number,
  string,
  StructError,
  union
} from "superstruct";
var NumberLikeStruct = union([number(), bigint(), string(), StrictHexStruct]);
var NumberCoercer = coerce(number(), NumberLikeStruct, Number);
var BigIntCoercer = coerce(bigint(), NumberLikeStruct, BigInt);
var BytesLikeStruct = union([StrictHexStruct, instance(Uint8Array)]);
var BytesCoercer = coerce(
  instance(Uint8Array),
  union([StrictHexStruct]),
  hexToBytes
);
var HexCoercer = coerce(StrictHexStruct, instance(Uint8Array), bytesToHex);
function createNumber(value) {
  try {
    const result = create(value, NumberCoercer);
    assert(
      Number.isFinite(result),
      `Expected a number-like value, got "${value}".`
    );
    return result;
  } catch (error) {
    if (error instanceof StructError) {
      throw new Error(`Expected a number-like value, got "${value}".`);
    }
    throw error;
  }
}
function createBigInt(value) {
  try {
    return create(value, BigIntCoercer);
  } catch (error) {
    if (error instanceof StructError) {
      throw new Error(
        `Expected a number-like value, got "${String(error.value)}".`
      );
    }
    throw error;
  }
}
function createBytes(value) {
  if (typeof value === "string" && value.toLowerCase() === "0x") {
    return new Uint8Array();
  }
  try {
    return create(value, BytesCoercer);
  } catch (error) {
    if (error instanceof StructError) {
      throw new Error(
        `Expected a bytes-like value, got "${String(error.value)}".`
      );
    }
    throw error;
  }
}
function createHex(value) {
  if (value instanceof Uint8Array && value.length === 0 || typeof value === "string" && value.toLowerCase() === "0x") {
    return "0x";
  }
  try {
    return create(value, HexCoercer);
  } catch (error) {
    if (error instanceof StructError) {
      throw new Error(
        `Expected a bytes-like value, got "${String(error.value)}".`
      );
    }
    throw error;
  }
}

export {
  createNumber,
  createBigInt,
  createBytes,
  createHex
};
//# sourceMappingURL=chunk-O3EIM33O.mjs.map