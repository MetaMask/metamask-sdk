import { SupportedLanaugeCodes, TranslationForKey, TranslationKeys } from "./types";
import { findLanguageForCode, findUserLanguageCode, getNestedValue } from "./utils";


export function translate<T extends TranslationKeys>(key: T, language: SupportedLanaugeCodes): TranslationForKey<T> {
    const userLanguage = findUserLanguageCode(language)

    const translations = findLanguageForCode(userLanguage)

    return getNestedValue(translations, key) as TranslationForKey<T>;
}