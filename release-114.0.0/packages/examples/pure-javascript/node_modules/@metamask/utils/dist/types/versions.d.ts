import type { Struct } from 'superstruct';
import type { Opaque } from './opaque';
/**
 * {@link https://codemix.com/opaque-types-in-javascript/ Opaque} type for SemVer ranges.
 *
 * @example Use {@link assertIsSemVerRange} and {@link isValidSemVerRange} to cast to proper type.
 * ```typescript
 * const unsafeRange: string = dataFromUser();
 * assertIsSemVerRange(unsafeRange);
 * unsafeRange
 * // ^? SemVerRange
 * ```
 * @example If you know what you're doing and want to side-step type safety, casting from a string works correctly.
 * ```typescript
 * const unsafeRange: string = dataFromUser();
 * unsafeRange as SemVerRange;
 * // ^? SemVerRange
 * ```
 * @see {@link assertIsSemVerRange}
 * @see {@link isValidSemVerRange}
 */
export declare type SemVerRange = Opaque<string, typeof semVerRange>;
declare const semVerRange: unique symbol;
/**
 * {@link https://codemix.com/opaque-types-in-javascript/ Opaque} type for singular SemVer version.
 *
 * @example Use {@link assertIsSemVerVersion} and {@link isValidSemVerVersion} to cast to proper type.
 * ```typescript
 * const unsafeVersion: string = dataFromUser();
 * assertIsSemVerVersion(unsafeRange);
 * unsafeVersion
 * // ^? SemVerVersion
 * ```
 * @example If you know what you're doing and want to side-step type safety, casting from a string works correctly.
 * ```typescript
 * const unsafeVersion: string = dataFromUser();
 * unsafeRange as SemVerVersion;
 * // ^? SemVerVersion
 * ```
 * @see {@link assertIsSemVerVersion}
 * @see {@link isValidSemVerVersion}
 */
export declare type SemVerVersion = Opaque<string, typeof semVerVersion>;
declare const semVerVersion: unique symbol;
/**
 * A struct for validating a version string.
 */
export declare const VersionStruct: Struct<SemVerVersion, null>;
export declare const VersionRangeStruct: Struct<SemVerRange, null>;
/**
 * Checks whether a SemVer version is valid.
 *
 * @param version - A potential version.
 * @returns `true` if the version is valid, and `false` otherwise.
 */
export declare function isValidSemVerVersion(version: unknown): version is SemVerVersion;
/**
 * Checks whether a SemVer version range is valid.
 *
 * @param versionRange - A potential version range.
 * @returns `true` if the version range is valid, and `false` otherwise.
 */
export declare function isValidSemVerRange(versionRange: unknown): versionRange is SemVerRange;
/**
 * Asserts that a value is a valid concrete SemVer version.
 *
 * @param version - A potential SemVer concrete version.
 */
export declare function assertIsSemVerVersion(version: unknown): asserts version is SemVerVersion;
/**
 * Asserts that a value is a valid SemVer range.
 *
 * @param range - A potential SemVer range.
 */
export declare function assertIsSemVerRange(range: unknown): asserts range is SemVerRange;
/**
 * Checks whether a SemVer version is greater than another.
 *
 * @param version1 - The left-hand version.
 * @param version2 - The right-hand version.
 * @returns `version1 > version2`.
 */
export declare function gtVersion(version1: SemVerVersion, version2: SemVerVersion): boolean;
/**
 * Checks whether a SemVer version is greater than all possibilities in a range.
 *
 * @param version - A SemvVer version.
 * @param range - The range to check against.
 * @returns `version > range`.
 */
export declare function gtRange(version: SemVerVersion, range: SemVerRange): boolean;
/**
 * Returns whether a SemVer version satisfies a SemVer range.
 *
 * @param version - The SemVer version to check.
 * @param versionRange - The SemVer version range to check against.
 * @returns Whether the version satisfied the version range.
 */
export declare function satisfiesVersionRange(version: SemVerVersion, versionRange: SemVerRange): boolean;
export {};
//# sourceMappingURL=versions.d.ts.map