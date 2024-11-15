import type { Struct } from 'superstruct';
export declare type AssertionErrorConstructor = (new (args: {
    message: string;
}) => Error) | ((args: {
    message: string;
}) => Error);
/**
 * The default error class that is thrown if an assertion fails.
 */
export declare class AssertionError extends Error {
    readonly code = "ERR_ASSERTION";
    constructor(options: {
        message: string;
    });
}
/**
 * Same as Node.js assert.
 * If the value is falsy, throws an error, does nothing otherwise.
 *
 * @throws {@link AssertionError} If value is falsy.
 * @param value - The test that should be truthy to pass.
 * @param message - Message to be passed to {@link AssertionError} or an
 * {@link Error} instance to throw.
 * @param ErrorWrapper - The error class to throw if the assertion fails.
 * Defaults to {@link AssertionError}. If a custom error class is provided for
 * the `message` argument, this argument is ignored.
 */
export declare function assert(value: any, message?: string | Error, ErrorWrapper?: AssertionErrorConstructor): asserts value;
/**
 * Assert a value against a Superstruct struct.
 *
 * @param value - The value to validate.
 * @param struct - The struct to validate against.
 * @param errorPrefix - A prefix to add to the error message. Defaults to
 * "Assertion failed".
 * @param ErrorWrapper - The error class to throw if the assertion fails.
 * Defaults to {@link AssertionError}.
 * @throws If the value is not valid.
 */
export declare function assertStruct<Type, Schema>(value: unknown, struct: Struct<Type, Schema>, errorPrefix?: string, ErrorWrapper?: AssertionErrorConstructor): asserts value is Type;
/**
 * Use in the default case of a switch that you want to be fully exhaustive.
 * Using this function forces the compiler to enforce exhaustivity during
 * compile-time.
 *
 * @example
 * ```
 * const number = 1;
 * switch (number) {
 *   case 0:
 *     ...
 *   case 1:
 *     ...
 *   default:
 *     assertExhaustive(snapPrefix);
 * }
 * ```
 * @param _object - The object on which the switch is being operated.
 */
export declare function assertExhaustive(_object: never): never;
//# sourceMappingURL=assert.d.ts.map