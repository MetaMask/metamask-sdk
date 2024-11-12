import locales from './locales'

export type SupportedLanaugeCodes = keyof typeof locales

export type Translations = (typeof locales)[SupportedLanaugeCodes]

type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
      ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
      : `${Key}`;
  }[keyof ObjectType & (string | number)];

type DeepValue<O, K> = K extends `${infer Head}.${infer Rest}`
  ? Head extends keyof O
    ? DeepValue<O[Head], Rest>
    : never
  : K extends keyof O
    ? O[K]
    : never;

export type TranslationKeys = NestedKeyOf<Translations>;

export type TranslationForKey<T extends TranslationKeys> = DeepValue<Translations, T>