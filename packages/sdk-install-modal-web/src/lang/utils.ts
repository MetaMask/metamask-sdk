import { SupportedLanaugeCodes, TranslationForKey, TranslationKeys, Translations } from "./types";
import locales from "./locales";

export function findLanguageForCode(code: SupportedLanaugeCodes): Translations {
    if (code in locales) {
        return locales[code]
    }

    throw new Error(`Invalid language code ${code}`)
}

export function isLanguageCodeSupported(code: string): code is SupportedLanaugeCodes {
    return code in locales
}

export function findUserLanguageCode(def: SupportedLanaugeCodes = "en"): SupportedLanaugeCodes {
    if (!window || !window.navigator) {
        return def;
    }

    const language = window.navigator.language

    if (!isLanguageCodeSupported(language)) {
        return def;
    }

    return language
}

export function getNestedValue<K extends TranslationKeys>(obj: Translations, key: K): TranslationForKey<K> {
  const keys = key.split('.');
  let result: any = obj;

  for (const k of keys) {
    if (result && typeof result === 'object') {
      result = result[k];
    } else {
      throw new Error(`Key ${key} not found`);
    }
  }
  return result as TranslationForKey<K>;
}