import type { Infer } from 'superstruct';
import type { Hex } from './hex';
declare const NumberLikeStruct: import("superstruct").Struct<string | number | bigint, null>;
declare const BytesLikeStruct: import("superstruct").Struct<Uint8Array | `0x${string}`, null>;
export declare type NumberLike = Infer<typeof NumberLikeStruct>;
export declare type BytesLike = Infer<typeof BytesLikeStruct>;
/**
 * Create a number from a number-like value.
 *
 * - If the value is a number, it is returned as-is.
 * - If the value is a `bigint`, it is converted to a number.
 * - If the value is a string, it is interpreted as a decimal number.
 * - If the value is a hex string (i.e., it starts with "0x"), it is
 * interpreted as a hexadecimal number.
 *
 * This validates that the value is a number-like value, and that the resulting
 * number is not `NaN` or `Infinity`.
 *
 * @example
 * ```typescript
 * const value = createNumber('0x010203');
 * console.log(value); // 66051
 *
 * const otherValue = createNumber(123n);
 * console.log(otherValue); // 123
 * ```
 * @param value - The value to create the number from.
 * @returns The created number.
 * @throws If the value is not a number-like value, or if the resulting number
 * is `NaN` or `Infinity`.
 */
export declare function createNumber(value: NumberLike): number;
/**
 * Create a `bigint` from a number-like value.
 *
 * - If the value is a number, it is converted to a `bigint`.
 * - If the value is a `bigint`, it is returned as-is.
 * - If the value is a string, it is interpreted as a decimal number and
 * converted to a `bigint`.
 * - If the value is a hex string (i.e., it starts with "0x"), it is
 * interpreted as a hexadecimal number and converted to a `bigint`.
 *
 * @example
 * ```typescript
 * const value = createBigInt('0x010203');
 * console.log(value); // 16909060n
 *
 * const otherValue = createBigInt(123);
 * console.log(otherValue); // 123n
 * ```
 * @param value - The value to create the bigint from.
 * @returns The created bigint.
 * @throws If the value is not a number-like value.
 */
export declare function createBigInt(value: NumberLike): bigint;
/**
 * Create a byte array from a bytes-like value.
 *
 * - If the value is a byte array, it is returned as-is.
 * - If the value is a hex string (i.e., it starts with "0x"), it is interpreted
 * as a hexadecimal number and converted to a byte array.
 *
 * @example
 * ```typescript
 * const value = createBytes('0x010203');
 * console.log(value); // Uint8Array [ 1, 2, 3 ]
 *
 * const otherValue = createBytes('0x010203');
 * console.log(otherValue); // Uint8Array [ 1, 2, 3 ]
 * ```
 * @param value - The value to create the byte array from.
 * @returns The created byte array.
 * @throws If the value is not a bytes-like value.
 */
export declare function createBytes(value: BytesLike): Uint8Array;
/**
 * Create a hexadecimal string from a bytes-like value.
 *
 * - If the value is a hex string (i.e., it starts with "0x"), it is returned
 * as-is.
 * - If the value is a `Uint8Array`, it is converted to a hex string.
 *
 * @example
 * ```typescript
 * const value = createHex(new Uint8Array([1, 2, 3]));
 * console.log(value); // '0x010203'
 *
 * const otherValue = createHex('0x010203');
 * console.log(otherValue); // '0x010203'
 * ```
 * @param value - The value to create the hex string from.
 * @returns The created hex string.
 * @throws If the value is not a bytes-like value.
 */
export declare function createHex(value: BytesLike): Hex;
export {};
//# sourceMappingURL=coercers.d.ts.map