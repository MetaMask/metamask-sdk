"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkQEPVHEP7js = require('./chunk-QEPVHEP7.js');


var _chunk6ZDHSOUVjs = require('./chunk-6ZDHSOUV.js');

// src/number.ts
var numberToHex = (value) => {
  _chunk6ZDHSOUVjs.assert.call(void 0, typeof value === "number", "Value must be a number.");
  _chunk6ZDHSOUVjs.assert.call(void 0, value >= 0, "Value must be a non-negative number.");
  _chunk6ZDHSOUVjs.assert.call(void 0, 
    Number.isSafeInteger(value),
    "Value is not a safe integer. Use `bigIntToHex` instead."
  );
  return _chunkQEPVHEP7js.add0x.call(void 0, value.toString(16));
};
var bigIntToHex = (value) => {
  _chunk6ZDHSOUVjs.assert.call(void 0, typeof value === "bigint", "Value must be a bigint.");
  _chunk6ZDHSOUVjs.assert.call(void 0, value >= 0, "Value must be a non-negative bigint.");
  return _chunkQEPVHEP7js.add0x.call(void 0, value.toString(16));
};
var hexToNumber = (value) => {
  _chunkQEPVHEP7js.assertIsHexString.call(void 0, value);
  const numberValue = parseInt(value, 16);
  _chunk6ZDHSOUVjs.assert.call(void 0, 
    Number.isSafeInteger(numberValue),
    "Value is not a safe integer. Use `hexToBigInt` instead."
  );
  return numberValue;
};
var hexToBigInt = (value) => {
  _chunkQEPVHEP7js.assertIsHexString.call(void 0, value);
  return BigInt(_chunkQEPVHEP7js.add0x.call(void 0, value));
};






exports.numberToHex = numberToHex; exports.bigIntToHex = bigIntToHex; exports.hexToNumber = hexToNumber; exports.hexToBigInt = hexToBigInt;
//# sourceMappingURL=chunk-VFXTVNXN.js.map