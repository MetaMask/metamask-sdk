/**
 * Makes every specified property of the specified object type mutable.
 *
 * @template ObjectValue - The object whose readonly properties to make mutable.
 * @template TargetKey - The property key(s) to make mutable.
 */
export declare type Mutable<ObjectValue extends Record<string, unknown>, TargetKey extends keyof ObjectValue> = {
    -readonly [Key in keyof Pick<ObjectValue, TargetKey>]: ObjectValue[Key];
} & {
    [Key in keyof Omit<ObjectValue, TargetKey>]: ObjectValue[Key];
};
/**
 * Useful for representing some value that _might_ be present and / or complete.
 *
 * @template Value - The value that might be present or complete.
 */
export declare type PartialOrAbsent<Value> = Partial<Value> | null | undefined;
/**
 * Like {@link Array}, but always non-empty.
 *
 * @template Element - The non-empty array member type.
 */
export declare type NonEmptyArray<Element> = [Element, ...Element[]];
/**
 * A JavaScript object that is not `null`, a function, or an array.
 */
export declare type RuntimeObject = Record<PropertyKey, unknown>;
/**
 * A {@link NonEmptyArray} type guard.
 *
 * @template Element - The non-empty array member type.
 * @param value - The value to check.
 * @returns Whether the value is a non-empty array.
 */
export declare function isNonEmptyArray<Element>(value: Element[]): value is NonEmptyArray<Element>;
/**
 * Type guard for "nullishness".
 *
 * @param value - Any value.
 * @returns `true` if the value is null or undefined, `false` otherwise.
 */
export declare function isNullOrUndefined(value: unknown): value is null | undefined;
/**
 * A type guard for {@link RuntimeObject}.
 *
 * @param value - The value to check.
 * @returns Whether the specified value has a runtime type of `object` and is
 * neither `null` nor an `Array`.
 */
export declare function isObject(value: unknown): value is RuntimeObject;
/**
 * A type guard for ensuring an object has a property.
 *
 * @param objectToCheck - The object to check.
 * @param name - The property name to check for.
 * @returns Whether the specified object has an own property with the specified
 * name, regardless of whether it is enumerable or not.
 */
export declare const hasProperty: <ObjectToCheck extends Object, Property extends PropertyKey>(objectToCheck: ObjectToCheck, name: Property) => objectToCheck is ObjectToCheck & Record<Property, Property extends keyof ObjectToCheck ? ObjectToCheck[Property] : unknown>;
/**
 * `Object.getOwnPropertyNames()` is intentionally generic: it returns the
 * immediate property names of an object, but it cannot make guarantees about
 * the contents of that object, so the type of the property names is merely
 * `string[]`. While this is technically accurate, it is also unnecessary if we
 * have an object with a type that we own (such as an enum).
 *
 * @param object - The plain object.
 * @returns The own property names of the object which are assigned a type
 * derived from the object itself.
 */
export declare function getKnownPropertyNames<Key extends PropertyKey>(object: Partial<Record<Key, any>>): Key[];
export declare type PlainObject = Record<number | string | symbol, unknown>;
/**
 * Predefined sizes (in Bytes) of specific parts of JSON structure.
 */
export declare enum JsonSize {
    Null = 4,
    Comma = 1,
    Wrapper = 1,
    True = 4,
    False = 5,
    Quote = 1,
    Colon = 1,
    Date = 24
}
/**
 * Regular expression with pattern matching for (special) escaped characters.
 */
export declare const ESCAPE_CHARACTERS_REGEXP: RegExp;
/**
 * Check if the value is plain object.
 *
 * @param value - Value to be checked.
 * @returns True if an object is the plain JavaScript object,
 * false if the object is not plain (e.g. function).
 */
export declare function isPlainObject(value: unknown): value is PlainObject;
/**
 * Check if character is ASCII.
 *
 * @param character - Character.
 * @returns True if a character code is ASCII, false if not.
 */
export declare function isASCII(character: string): boolean;
/**
 * Calculate string size.
 *
 * @param value - String value to calculate size.
 * @returns Number of bytes used to store whole string value.
 */
export declare function calculateStringSize(value: string): number;
/**
 * Calculate size of a number ofter JSON serialization.
 *
 * @param value - Number value to calculate size.
 * @returns Number of bytes used to store whole number in JSON.
 */
export declare function calculateNumberSize(value: number): number;
//# sourceMappingURL=misc.d.ts.map