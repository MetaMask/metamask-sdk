"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunkQEPVHEP7js = require('./chunk-QEPVHEP7.js');


var _chunk6ZDHSOUVjs = require('./chunk-6ZDHSOUV.js');

// src/coercers.ts









var _superstruct = require('superstruct');
var NumberLikeStruct = _superstruct.union.call(void 0, [_superstruct.number.call(void 0, ), _superstruct.bigint.call(void 0, ), _superstruct.string.call(void 0, ), _chunkQEPVHEP7js.StrictHexStruct]);
var NumberCoercer = _superstruct.coerce.call(void 0, _superstruct.number.call(void 0, ), NumberLikeStruct, Number);
var BigIntCoercer = _superstruct.coerce.call(void 0, _superstruct.bigint.call(void 0, ), NumberLikeStruct, BigInt);
var BytesLikeStruct = _superstruct.union.call(void 0, [_chunkQEPVHEP7js.StrictHexStruct, _superstruct.instance.call(void 0, Uint8Array)]);
var BytesCoercer = _superstruct.coerce.call(void 0, 
  _superstruct.instance.call(void 0, Uint8Array),
  _superstruct.union.call(void 0, [_chunkQEPVHEP7js.StrictHexStruct]),
  _chunkQEPVHEP7js.hexToBytes
);
var HexCoercer = _superstruct.coerce.call(void 0, _chunkQEPVHEP7js.StrictHexStruct, _superstruct.instance.call(void 0, Uint8Array), _chunkQEPVHEP7js.bytesToHex);
function createNumber(value) {
  try {
    const result = _superstruct.create.call(void 0, value, NumberCoercer);
    _chunk6ZDHSOUVjs.assert.call(void 0, 
      Number.isFinite(result),
      `Expected a number-like value, got "${value}".`
    );
    return result;
  } catch (error) {
    if (error instanceof _superstruct.StructError) {
      throw new Error(`Expected a number-like value, got "${value}".`);
    }
    throw error;
  }
}
function createBigInt(value) {
  try {
    return _superstruct.create.call(void 0, value, BigIntCoercer);
  } catch (error) {
    if (error instanceof _superstruct.StructError) {
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
    return _superstruct.create.call(void 0, value, BytesCoercer);
  } catch (error) {
    if (error instanceof _superstruct.StructError) {
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
    return _superstruct.create.call(void 0, value, HexCoercer);
  } catch (error) {
    if (error instanceof _superstruct.StructError) {
      throw new Error(
        `Expected a bytes-like value, got "${String(error.value)}".`
      );
    }
    throw error;
  }
}






exports.createNumber = createNumber; exports.createBigInt = createBigInt; exports.createBytes = createBytes; exports.createHex = createHex;
//# sourceMappingURL=chunk-DHVKFDHQ.js.map