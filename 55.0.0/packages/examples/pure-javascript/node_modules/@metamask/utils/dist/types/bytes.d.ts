import type { Hex } from './hex';
export declare type Bytes = bigint | number | string | Uint8Array;
/**
 * Check if a value is a `Uint8Array`.
 *
 * @param value - The value to check.
 * @returns Whether the value is a `Uint8Array`.
 */
export declare function isBytes(value: unknown): value is Uint8Array;
/**
 * Assert that a value is a `Uint8Array`.
 *
 * @param value - The value to check.
 * @throws If the value is not a `Uint8Array`.
 */
export declare function assertIsBytes(value: unknown): asserts value is Uint8Array;
/**
 * Convert a `Uint8Array` to a hexadecimal string.
 *
 * @param bytes - The bytes to convert to a hexadecimal string.
 * @returns The hexadecimal string.
 */
export declare function bytesToHex(bytes: Uint8Array): Hex;
/**
 * Convert a `Uint8Array` to a `bigint`.
 *
 * To convert a `Uint8Array` to a `number` instead, use {@link bytesToNumber}.
 * To convert a two's complement encoded `Uint8Array` to a `bigint`, use
 * {@link bytesToSignedBigInt}.
 *
 * @param bytes - The bytes to convert to a `bigint`.
 * @returns The `bigint`.
 */
export declare function bytesToBigInt(bytes: Uint8Array): bigint;
/**
 * Convert a `Uint8Array` to a signed `bigint`. This assumes that the bytes are
 * encoded in two's complement.
 *
 * To convert a `Uint8Array` to an unsigned `bigint` instead, use
 * {@link bytesToBigInt}.
 *
 * @see https://en.wikipedia.org/wiki/Two%27s_complement
 * @param bytes - The bytes to convert to a signed `bigint`.
 * @returns The signed `bigint`.
 */
export declare function bytesToSignedBigInt(bytes: Uint8Array): bigint;
/**
 * Convert a `Uint8Array` to a `number`.
 *
 * To convert a `Uint8Array` to a `bigint` instead, use {@link bytesToBigInt}.
 *
 * @param bytes - The bytes to convert to a number.
 * @returns The number.
 * @throws If the resulting number is not a safe integer.
 */
export declare function bytesToNumber(bytes: Uint8Array): number;
/**
 * Convert a UTF-8 encoded `Uint8Array` to a `string`.
 *
 * @param bytes - The bytes to convert to a string.
 * @returns The string.
 */
export declare function bytesToString(bytes: Uint8Array): string;
/**
 * Convert a `Uint8Array` to a base64 encoded string.
 *
 * @param bytes - The bytes to convert to a base64 encoded string.
 * @returns The base64 encoded string.
 */
export declare function bytesToBase64(bytes: Uint8Array): string;
/**
 * Convert a hexadecimal string to a `Uint8Array`. The string can optionally be
 * prefixed with `0x`. It accepts even and odd length strings.
 *
 * If the value is "0x", an empty `Uint8Array` is returned.
 *
 * @param value - The hexadecimal string to convert to bytes.
 * @returns The bytes as `Uint8Array`.
 */
export declare function hexToBytes(value: string): Uint8Array;
/**
 * Convert a `bigint` to a `Uint8Array`.
 *
 * This assumes that the `bigint` is an unsigned integer. To convert a signed
 * `bigint` instead, use {@link signedBigIntToBytes}.
 *
 * @param value - The bigint to convert to bytes.
 * @returns The bytes as `Uint8Array`.
 */
export declare function bigIntToBytes(value: bigint): Uint8Array;
/**
 * Convert a signed `bigint` to a `Uint8Array`. This uses two's complement
 * encoding to represent negative numbers.
 *
 * To convert an unsigned `bigint` to a `Uint8Array` instead, use
 * {@link bigIntToBytes}.
 *
 * @see https://en.wikipedia.org/wiki/Two%27s_complement
 * @param value - The number to convert to bytes.
 * @param byteLength - The length of the resulting `Uint8Array`. If the number
 * is larger than the maximum value that can be represented by the given length,
 * an error is thrown.
 * @returns The bytes as `Uint8Array`.
 */
export declare function signedBigIntToBytes(value: bigint, byteLength: number): Uint8Array;
/**
 * Convert a `number` to a `Uint8Array`.
 *
 * @param value - The number to convert to bytes.
 * @returns The bytes as `Uint8Array`.
 * @throws If the number is not a safe integer.
 */
export declare function numberToBytes(value: number): Uint8Array;
/**
 * Convert a `string` to a UTF-8 encoded `Uint8Array`.
 *
 * @param value - The string to convert to bytes.
 * @returns The bytes as `Uint8Array`.
 */
export declare function stringToBytes(value: string): Uint8Array;
/**
 * Convert a base64 encoded string to a `Uint8Array`.
 *
 * @param value - The base64 encoded string to convert to bytes.
 * @returns The bytes as `Uint8Array`.
 */
export declare function base64ToBytes(value: string): Uint8Array;
/**
 * Convert a byte-like value to a `Uint8Array`. The value can be a `Uint8Array`,
 * a `bigint`, a `number`, or a `string`.
 *
 * This will attempt to guess the type of the value based on its type and
 * contents. For more control over the conversion, use the more specific
 * conversion functions, such as {@link hexToBytes} or {@link stringToBytes}.
 *
 * If the value is a `string`, and it is prefixed with `0x`, it will be
 * interpreted as a hexadecimal string. Otherwise, it will be interpreted as a
 * UTF-8 string. To convert a hexadecimal string to bytes without interpreting
 * it as a UTF-8 string, use {@link hexToBytes} instead.
 *
 * If the value is a `bigint`, it is assumed to be unsigned. To convert a signed
 * `bigint` to bytes, use {@link signedBigIntToBytes} instead.
 *
 * If the value is a `Uint8Array`, it will be returned as-is.
 *
 * @param value - The value to convert to bytes.
 * @returns The bytes as `Uint8Array`.
 */
export declare function valueToBytes(value: Bytes): Uint8Array;
/**
 * Concatenate multiple byte-like values into a single `Uint8Array`. The values
 * can be `Uint8Array`, `bigint`, `number`, or `string`. This uses
 * {@link valueToBytes} under the hood to convert each value to bytes. Refer to
 * the documentation of that function for more information.
 *
 * @param values - The values to concatenate.
 * @returns The concatenated bytes as `Uint8Array`.
 */
export declare function concatBytes(values: Bytes[]): Uint8Array;
/**
 * Create a {@link DataView} from a {@link Uint8Array}. This is a convenience
 * function that avoids having to create a {@link DataView} manually, which
 * requires passing the `byteOffset` and `byteLength` parameters every time.
 *
 * Not passing the `byteOffset` and `byteLength` parameters can result in
 * unexpected behavior when the {@link Uint8Array} is a view of a larger
 * {@link ArrayBuffer}, e.g., when using {@link Uint8Array.subarray}.
 *
 * This function also supports Node.js {@link Buffer}s.
 *
 * @example
 * ```typescript
 * const bytes = new Uint8Array([1, 2, 3]);
 *
 * // This is equivalent to:
 * // const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
 * const dataView = createDataView(bytes);
 * ```
 * @param bytes - The bytes to create the {@link DataView} from.
 * @returns The {@link DataView}.
 */
export declare function createDataView(bytes: Uint8Array): DataView;
//# sourceMappingURL=bytes.d.ts.map