import type { Infer } from 'superstruct';
import { Struct } from 'superstruct';
import type { ObjectSchema, Optionalize, Simplify } from 'superstruct/dist/utils';
import type { AssertionErrorConstructor } from './assert';
/**
 * Any JSON-compatible value.
 */
export declare type Json = null | boolean | number | string | Json[] | {
    [prop: string]: Json;
};
/**
 * A helper type to make properties with `undefined` in their type optional, but
 * not `undefined` itself.
 *
 * @example
 * ```ts
 * type Foo = ObjectOptional<{ foo: string | undefined }>;
 * // Foo is equivalent to { foo?: string }
 * ```
 */
export declare type ObjectOptional<Schema extends Record<string, unknown>> = {
    [Key in keyof Schema as Schema[Key] extends ExactOptionalGuard ? Key : never]?: Schema[Key] extends ExactOptionalGuard & infer Original ? Original : never;
} & {
    [Key in keyof Schema as Schema[Key] extends ExactOptionalGuard ? never : Key]: Schema[Key];
};
/**
 * An object type with support for exact optionals. This is used by the `object`
 * struct. This uses the {@link ObjectOptional} helper to make properties with
 * `undefined` in their type optional, but not `undefined` itself.
 */
export declare type ObjectType<Schema extends ObjectSchema> = Simplify<ObjectOptional<Optionalize<{
    [Key in keyof Schema]: Infer<Schema[Key]>;
}>>>;
/**
 * A struct to check if the given value is a valid object, with support for
 * {@link exactOptional} types.
 *
 * @param schema - The schema of the object.
 * @returns A struct to check if the given value is an object.
 */
export declare const object: <Schema extends ObjectSchema>(schema: Schema) => Struct<Simplify<ObjectOptional<Optionalize<{ [Key in keyof Schema]: Infer<Schema[Key]>; }>>>, unknown>;
declare const exactOptionalSymbol: unique symbol;
declare type ExactOptionalGuard = {
    _exactOptionalGuard?: typeof exactOptionalSymbol;
};
/**
 * A struct which allows the property of an object to be absent, or to be present
 * as long as it's valid and not set to `undefined`.
 *
 * This struct should be used in conjunction with the {@link object} from this
 * library, to get proper type inference.
 *
 * @param struct - The struct to check the value against, if present.
 * @returns A struct to check if the given value is valid, or not present.
 * @example
 * ```ts
 * const struct = object({
 *   foo: exactOptional(string()),
 *   bar: exactOptional(number()),
 *   baz: optional(boolean()),
 *   qux: unknown(),
 * });
 *
 * type Type = Infer<typeof struct>;
 * // Type is equivalent to:
 * // {
 * //   foo?: string;
 * //   bar?: number;
 * //   baz?: boolean | undefined;
 * //   qux: unknown;
 * // }
 * ```
 */
export declare function exactOptional<Type, Schema>(struct: Struct<Type, Schema>): Struct<Type & ExactOptionalGuard, Schema>;
/**
 * A struct to check if the given value is a valid JSON-serializable value.
 *
 * Note that this struct is unsafe. For safe validation, use {@link JsonStruct}.
 */
export declare const UnsafeJsonStruct: Struct<Json>;
/**
 * A struct to check if the given value is a valid JSON-serializable value.
 *
 * This struct sanitizes the value before validating it, so that it is safe to
 * use with untrusted input.
 */
export declare const JsonStruct: Struct<Json, unknown>;
/**
 * Check if the given value is a valid {@link Json} value, i.e., a value that is
 * serializable to JSON.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link Json} value.
 */
export declare function isValidJson(value: unknown): value is Json;
/**
 * Validate and return sanitized JSON.
 *
 * Note:
 * This function uses sanitized JsonStruct for validation
 * that applies stringify and then parse of a value provided
 * to ensure that there are no getters which can have side effects
 * that can cause security issues.
 *
 * @param value - JSON structure to be processed.
 * @returns Sanitized JSON structure.
 */
export declare function getSafeJson<Type extends Json = Json>(value: unknown): Type;
/**
 * Get the size of a JSON value in bytes. This also validates the value.
 *
 * @param value - The JSON value to get the size of.
 * @returns The size of the JSON value in bytes.
 */
export declare function getJsonSize(value: unknown): number;
/**
 * The string '2.0'.
 */
export declare const jsonrpc2: "2.0";
export declare const JsonRpcVersionStruct: Struct<"2.0", "2.0">;
/**
 * A String specifying the version of the JSON-RPC protocol.
 * MUST be exactly "2.0".
 */
export declare type JsonRpcVersion2 = typeof jsonrpc2;
export declare const JsonRpcIdStruct: Struct<string | number | null, null>;
/**
 * An identifier established by the Client that MUST contain a String, Number,
 * or NULL value if included. If it is not included it is assumed to be a
 * notification. The value SHOULD normally not be Null and Numbers SHOULD
 * NOT contain fractional parts.
 */
export declare type JsonRpcId = Infer<typeof JsonRpcIdStruct>;
export declare const JsonRpcErrorStruct: Struct<{
    data?: Json & ExactOptionalGuard;
    stack?: string;
    code: number;
    message: string;
}, unknown>;
/**
 * Mark a certain key of a type as optional.
 */
export declare type OptionalField<Type extends Record<string, unknown>, Key extends keyof Type> = Omit<Type, Key> & Partial<Pick<Type, Key>>;
/**
 * A JSON-RPC error object.
 *
 * Note that TypeScript infers `unknown | undefined` as `unknown`, meaning that
 * the `data` field is not optional. To make it optional, we use the
 * `OptionalField` helper, to explicitly make it optional.
 */
export declare type JsonRpcError = OptionalField<Infer<typeof JsonRpcErrorStruct>, 'data'>;
export declare const JsonRpcParamsStruct: Struct<Json[] | Record<string, Json>, null>;
export declare type JsonRpcParams = Json[] | Record<string, Json>;
export declare const JsonRpcRequestStruct: Struct<{
    params?: (Json[] | Record<string, Json>) & ExactOptionalGuard;
    id: string | number | null;
    method: string;
    jsonrpc: "2.0";
}, unknown>;
export declare type InferWithParams<Type extends Struct<any>, Params extends JsonRpcParams> = Infer<Type> & {
    params?: Params;
};
/**
 * A JSON-RPC request object.
 */
export declare type JsonRpcRequest<Params extends JsonRpcParams = JsonRpcParams> = InferWithParams<typeof JsonRpcRequestStruct, Params>;
export declare const JsonRpcNotificationStruct: Struct<{
    params?: (Json[] | Record<string, Json>) & ExactOptionalGuard;
    method: string;
    jsonrpc: "2.0";
}, unknown>;
/**
 * A JSON-RPC notification object.
 */
export declare type JsonRpcNotification<Params extends JsonRpcParams = JsonRpcParams> = InferWithParams<typeof JsonRpcNotificationStruct, Params>;
/**
 * Check if the given value is a valid {@link JsonRpcNotification} object.
 *
 * @param value - The value to check.
 * @returns Whether the given value is a valid {@link JsonRpcNotification}
 * object.
 */
export declare function isJsonRpcNotification(value: unknown): value is JsonRpcNotification;
/**
 * Assert that the given value is a valid {@link JsonRpcNotification} object.
 *
 * @param value - The value to check.
 * @param ErrorWrapper - The error class to throw if the assertion fails.
 * Defaults to {@link AssertionError}.
 * @throws If the given value is not a valid {@link JsonRpcNotification} object.
 */
export declare function assertIsJsonRpcNotification(value: unknown, ErrorWrapper?: AssertionErrorConstructor): asserts value is JsonRpcNotification;
/**
 * Check if the given value is a valid {@link JsonRpcRequest} object.
 *
 * @param value - The value to check.
 * @returns Whether the given value is a valid {@link JsonRpcRequest} object.
 */
export declare function isJsonRpcRequest(value: unknown): value is JsonRpcRequest;
/**
 * Assert that the given value is a valid {@link JsonRpcRequest} object.
 *
 * @param value - The JSON-RPC request or notification to check.
 * @param ErrorWrapper - The error class to throw if the assertion fails.
 * Defaults to {@link AssertionError}.
 * @throws If the given value is not a valid {@link JsonRpcRequest} object.
 */
export declare function assertIsJsonRpcRequest(value: unknown, ErrorWrapper?: AssertionErrorConstructor): asserts value is JsonRpcRequest;
export declare const PendingJsonRpcResponseStruct: Struct<{
    id: string | number | null;
    jsonrpc: "2.0";
    result: unknown;
    error?: {
        data?: Json & ExactOptionalGuard;
        stack?: string;
        code: number;
        message: string;
    } | undefined;
}, {
    id: Struct<string | number | null, null>;
    jsonrpc: Struct<"2.0", "2.0">;
    result: Struct<unknown, null>;
    error: Struct<{
        data?: Json & ExactOptionalGuard;
        stack?: string;
        code: number;
        message: string;
    } | undefined, unknown>;
}>;
/**
 * A JSON-RPC response object that has not yet been resolved.
 */
export declare type PendingJsonRpcResponse<Result extends Json> = Omit<Infer<typeof PendingJsonRpcResponseStruct>, 'result'> & {
    result?: Result;
};
export declare const JsonRpcSuccessStruct: Struct<{
    id: string | number | null;
    jsonrpc: "2.0";
    result: Json;
}, unknown>;
/**
 * A successful JSON-RPC response object.
 */
export declare type JsonRpcSuccess<Result extends Json> = Omit<Infer<typeof JsonRpcSuccessStruct>, 'result'> & {
    result: Result;
};
export declare const JsonRpcFailureStruct: Struct<{
    error: JsonRpcError;
    id: string | number | null;
    jsonrpc: "2.0";
}, unknown>;
/**
 * A failed JSON-RPC response object.
 */
export declare type JsonRpcFailure = Infer<typeof JsonRpcFailureStruct>;
export declare const JsonRpcResponseStruct: Struct<{
    id: string | number | null;
    jsonrpc: "2.0";
    result: Json;
} | {
    error: JsonRpcError;
    id: string | number | null;
    jsonrpc: "2.0";
}, null>;
/**
 * A JSON-RPC response object. Must be checked to determine whether it's a
 * success or failure.
 *
 * @template Result - The type of the result.
 */
export declare type JsonRpcResponse<Result extends Json> = JsonRpcSuccess<Result> | JsonRpcFailure;
/**
 * Type guard to check whether specified JSON-RPC response is a
 * {@link PendingJsonRpcResponse}.
 *
 * @param response - The JSON-RPC response to check.
 * @returns Whether the specified JSON-RPC response is pending.
 */
export declare function isPendingJsonRpcResponse(response: unknown): response is PendingJsonRpcResponse<Json>;
/**
 * Assert that the given value is a valid {@link PendingJsonRpcResponse} object.
 *
 * @param response - The JSON-RPC response to check.
 * @param ErrorWrapper - The error class to throw if the assertion fails.
 * Defaults to {@link AssertionError}.
 * @throws If the given value is not a valid {@link PendingJsonRpcResponse}
 * object.
 */
export declare function assertIsPendingJsonRpcResponse(response: unknown, ErrorWrapper?: AssertionErrorConstructor): asserts response is PendingJsonRpcResponse<Json>;
/**
 * Type guard to check if a value is a {@link JsonRpcResponse}.
 *
 * @param response - The object to check.
 * @returns Whether the object is a JsonRpcResponse.
 */
export declare function isJsonRpcResponse(response: unknown): response is JsonRpcResponse<Json>;
/**
 * Assert that the given value is a valid {@link JsonRpcResponse} object.
 *
 * @param value - The value to check.
 * @param ErrorWrapper - The error class to throw if the assertion fails.
 * Defaults to {@link AssertionError}.
 * @throws If the given value is not a valid {@link JsonRpcResponse} object.
 */
export declare function assertIsJsonRpcResponse(value: unknown, ErrorWrapper?: AssertionErrorConstructor): asserts value is JsonRpcResponse<Json>;
/**
 * Check if the given value is a valid {@link JsonRpcSuccess} object.
 *
 * @param value - The value to check.
 * @returns Whether the given value is a valid {@link JsonRpcSuccess} object.
 */
export declare function isJsonRpcSuccess(value: unknown): value is JsonRpcSuccess<Json>;
/**
 * Assert that the given value is a valid {@link JsonRpcSuccess} object.
 *
 * @param value - The value to check.
 * @param ErrorWrapper - The error class to throw if the assertion fails.
 * Defaults to {@link AssertionError}.
 * @throws If the given value is not a valid {@link JsonRpcSuccess} object.
 */
export declare function assertIsJsonRpcSuccess(value: unknown, ErrorWrapper?: AssertionErrorConstructor): asserts value is JsonRpcSuccess<Json>;
/**
 * Check if the given value is a valid {@link JsonRpcFailure} object.
 *
 * @param value - The value to check.
 * @returns Whether the given value is a valid {@link JsonRpcFailure} object.
 */
export declare function isJsonRpcFailure(value: unknown): value is JsonRpcFailure;
/**
 * Assert that the given value is a valid {@link JsonRpcFailure} object.
 *
 * @param value - The value to check.
 * @param ErrorWrapper - The error class to throw if the assertion fails.
 * Defaults to {@link AssertionError}.
 * @throws If the given value is not a valid {@link JsonRpcFailure} object.
 */
export declare function assertIsJsonRpcFailure(value: unknown, ErrorWrapper?: AssertionErrorConstructor): asserts value is JsonRpcFailure;
/**
 * Check if the given value is a valid {@link JsonRpcError} object.
 *
 * @param value - The value to check.
 * @returns Whether the given value is a valid {@link JsonRpcError} object.
 */
export declare function isJsonRpcError(value: unknown): value is JsonRpcError;
/**
 * Assert that the given value is a valid {@link JsonRpcError} object.
 *
 * @param value - The value to check.
 * @param ErrorWrapper - The error class to throw if the assertion fails.
 * Defaults to {@link AssertionError}.
 * @throws If the given value is not a valid {@link JsonRpcError} object.
 */
export declare function assertIsJsonRpcError(value: unknown, ErrorWrapper?: AssertionErrorConstructor): asserts value is JsonRpcError;
declare type JsonRpcValidatorOptions = {
    permitEmptyString?: boolean;
    permitFractions?: boolean;
    permitNull?: boolean;
};
/**
 * Gets a function for validating JSON-RPC request / response `id` values.
 *
 * By manipulating the options of this factory, you can control the behavior
 * of the resulting validator for some edge cases. This is useful because e.g.
 * `null` should sometimes but not always be permitted.
 *
 * Note that the empty string (`''`) is always permitted by the JSON-RPC
 * specification, but that kind of sucks and you may want to forbid it in some
 * instances anyway.
 *
 * For more details, see the
 * [JSON-RPC Specification](https://www.jsonrpc.org/specification).
 *
 * @param options - An options object.
 * @param options.permitEmptyString - Whether the empty string (i.e. `''`)
 * should be treated as a valid ID. Default: `true`
 * @param options.permitFractions - Whether fractional numbers (e.g. `1.2`)
 * should be treated as valid IDs. Default: `false`
 * @param options.permitNull - Whether `null` should be treated as a valid ID.
 * Default: `true`
 * @returns The JSON-RPC ID validator function.
 */
export declare function getJsonRpcIdValidator(options?: JsonRpcValidatorOptions): (id: unknown) => id is string | number | null;
export {};
//# sourceMappingURL=json.d.ts.map