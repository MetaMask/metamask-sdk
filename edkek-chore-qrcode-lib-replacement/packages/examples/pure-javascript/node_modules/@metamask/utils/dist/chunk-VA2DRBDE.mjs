import {
  assert
} from "./chunk-74DGVJVE.mjs";

// src/hex.ts
import { keccak_256 as keccak256 } from "@noble/hashes/sha3";
import { is, pattern, string } from "superstruct";

// src/bytes.ts
import { base64 } from "@scure/base";
var HEX_MINIMUM_NUMBER_CHARACTER = 48;
var HEX_MAXIMUM_NUMBER_CHARACTER = 58;
var HEX_CHARACTER_OFFSET = 87;
function getPrecomputedHexValuesBuilder() {
  const lookupTable = [];
  return () => {
    if (lookupTable.length === 0) {
      for (let i = 0; i < 256; i++) {
        lookupTable.push(i.toString(16).padStart(2, "0"));
      }
    }
    return lookupTable;
  };
}
var getPrecomputedHexValues = getPrecomputedHexValuesBuilder();
function isBytes(value) {
  return value instanceof Uint8Array;
}
function assertIsBytes(value) {
  assert(isBytes(value), "Value must be a Uint8Array.");
}
function bytesToHex(bytes) {
  assertIsBytes(bytes);
  if (bytes.length === 0) {
    return "0x";
  }
  const lookupTable = getPrecomputedHexValues();
  const hexadecimal = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    hexadecimal[i] = lookupTable[bytes[i]];
  }
  return add0x(hexadecimal.join(""));
}
function bytesToBigInt(bytes) {
  assertIsBytes(bytes);
  const hexadecimal = bytesToHex(bytes);
  return BigInt(hexadecimal);
}
function bytesToSignedBigInt(bytes) {
  assertIsBytes(bytes);
  let value = BigInt(0);
  for (const byte of bytes) {
    value = (value << BigInt(8)) + BigInt(byte);
  }
  return BigInt.asIntN(bytes.length * 8, value);
}
function bytesToNumber(bytes) {
  assertIsBytes(bytes);
  const bigint = bytesToBigInt(bytes);
  assert(
    bigint <= BigInt(Number.MAX_SAFE_INTEGER),
    "Number is not a safe integer. Use `bytesToBigInt` instead."
  );
  return Number(bigint);
}
function bytesToString(bytes) {
  assertIsBytes(bytes);
  return new TextDecoder().decode(bytes);
}
function bytesToBase64(bytes) {
  assertIsBytes(bytes);
  return base64.encode(bytes);
}
function hexToBytes(value) {
  if (value?.toLowerCase?.() === "0x") {
    return new Uint8Array();
  }
  assertIsHexString(value);
  const strippedValue = remove0x(value).toLowerCase();
  const normalizedValue = strippedValue.length % 2 === 0 ? strippedValue : `0${strippedValue}`;
  const bytes = new Uint8Array(normalizedValue.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const c1 = normalizedValue.charCodeAt(i * 2);
    const c2 = normalizedValue.charCodeAt(i * 2 + 1);
    const n1 = c1 - (c1 < HEX_MAXIMUM_NUMBER_CHARACTER ? HEX_MINIMUM_NUMBER_CHARACTER : HEX_CHARACTER_OFFSET);
    const n2 = c2 - (c2 < HEX_MAXIMUM_NUMBER_CHARACTER ? HEX_MINIMUM_NUMBER_CHARACTER : HEX_CHARACTER_OFFSET);
    bytes[i] = n1 * 16 + n2;
  }
  return bytes;
}
function bigIntToBytes(value) {
  assert(typeof value === "bigint", "Value must be a bigint.");
  assert(value >= BigInt(0), "Value must be a non-negative bigint.");
  const hexadecimal = value.toString(16);
  return hexToBytes(hexadecimal);
}
function bigIntFits(value, bytes) {
  assert(bytes > 0);
  const mask = value >> BigInt(31);
  return !((~value & mask) + (value & ~mask) >> BigInt(bytes * 8 + ~0));
}
function signedBigIntToBytes(value, byteLength) {
  assert(typeof value === "bigint", "Value must be a bigint.");
  assert(typeof byteLength === "number", "Byte length must be a number.");
  assert(byteLength > 0, "Byte length must be greater than 0.");
  assert(
    bigIntFits(value, byteLength),
    "Byte length is too small to represent the given value."
  );
  let numberValue = value;
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number(BigInt.asUintN(8, numberValue));
    numberValue >>= BigInt(8);
  }
  return bytes.reverse();
}
function numberToBytes(value) {
  assert(typeof value === "number", "Value must be a number.");
  assert(value >= 0, "Value must be a non-negative number.");
  assert(
    Number.isSafeInteger(value),
    "Value is not a safe integer. Use `bigIntToBytes` instead."
  );
  const hexadecimal = value.toString(16);
  return hexToBytes(hexadecimal);
}
function stringToBytes(value) {
  assert(typeof value === "string", "Value must be a string.");
  return new TextEncoder().encode(value);
}
function base64ToBytes(value) {
  assert(typeof value === "string", "Value must be a string.");
  return base64.decode(value);
}
function valueToBytes(value) {
  if (typeof value === "bigint") {
    return bigIntToBytes(value);
  }
  if (typeof value === "number") {
    return numberToBytes(value);
  }
  if (typeof value === "string") {
    if (value.startsWith("0x")) {
      return hexToBytes(value);
    }
    return stringToBytes(value);
  }
  if (isBytes(value)) {
    return value;
  }
  throw new TypeError(`Unsupported value type: "${typeof value}".`);
}
function concatBytes(values) {
  const normalizedValues = new Array(values.length);
  let byteLength = 0;
  for (let i = 0; i < values.length; i++) {
    const value = valueToBytes(values[i]);
    normalizedValues[i] = value;
    byteLength += value.length;
  }
  const bytes = new Uint8Array(byteLength);
  for (let i = 0, offset = 0; i < normalizedValues.length; i++) {
    bytes.set(normalizedValues[i], offset);
    offset += normalizedValues[i].length;
  }
  return bytes;
}
function createDataView(bytes) {
  if (typeof Buffer !== "undefined" && bytes instanceof Buffer) {
    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    );
    return new DataView(buffer);
  }
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

// src/hex.ts
var HexStruct = pattern(string(), /^(?:0x)?[0-9a-f]+$/iu);
var StrictHexStruct = pattern(string(), /^0x[0-9a-f]+$/iu);
var HexAddressStruct = pattern(
  string(),
  /^0x[0-9a-f]{40}$/u
);
var HexChecksumAddressStruct = pattern(
  string(),
  /^0x[0-9a-fA-F]{40}$/u
);
function isHexString(value) {
  return is(value, HexStruct);
}
function isStrictHexString(value) {
  return is(value, StrictHexStruct);
}
function assertIsHexString(value) {
  assert(isHexString(value), "Value must be a hexadecimal string.");
}
function assertIsStrictHexString(value) {
  assert(
    isStrictHexString(value),
    'Value must be a hexadecimal string, starting with "0x".'
  );
}
function isValidHexAddress(possibleAddress) {
  return is(possibleAddress, HexAddressStruct) || isValidChecksumAddress(possibleAddress);
}
function getChecksumAddress(address) {
  assert(is(address, HexChecksumAddressStruct), "Invalid hex address.");
  const unPrefixed = remove0x(address.toLowerCase());
  const unPrefixedHash = remove0x(bytesToHex(keccak256(unPrefixed)));
  return `0x${unPrefixed.split("").map((character, nibbleIndex) => {
    const hashCharacter = unPrefixedHash[nibbleIndex];
    assert(is(hashCharacter, string()), "Hash shorter than address.");
    return parseInt(hashCharacter, 16) > 7 ? character.toUpperCase() : character;
  }).join("")}`;
}
function isValidChecksumAddress(possibleChecksum) {
  if (!is(possibleChecksum, HexChecksumAddressStruct)) {
    return false;
  }
  return getChecksumAddress(possibleChecksum) === possibleChecksum;
}
function add0x(hexadecimal) {
  if (hexadecimal.startsWith("0x")) {
    return hexadecimal;
  }
  if (hexadecimal.startsWith("0X")) {
    return `0x${hexadecimal.substring(2)}`;
  }
  return `0x${hexadecimal}`;
}
function remove0x(hexadecimal) {
  if (hexadecimal.startsWith("0x") || hexadecimal.startsWith("0X")) {
    return hexadecimal.substring(2);
  }
  return hexadecimal;
}

export {
  HexStruct,
  StrictHexStruct,
  HexAddressStruct,
  HexChecksumAddressStruct,
  isHexString,
  isStrictHexString,
  assertIsHexString,
  assertIsStrictHexString,
  isValidHexAddress,
  getChecksumAddress,
  isValidChecksumAddress,
  add0x,
  remove0x,
  isBytes,
  assertIsBytes,
  bytesToHex,
  bytesToBigInt,
  bytesToSignedBigInt,
  bytesToNumber,
  bytesToString,
  bytesToBase64,
  hexToBytes,
  bigIntToBytes,
  signedBigIntToBytes,
  numberToBytes,
  stringToBytes,
  base64ToBytes,
  valueToBytes,
  concatBytes,
  createDataView
};
//# sourceMappingURL=chunk-VA2DRBDE.mjs.map