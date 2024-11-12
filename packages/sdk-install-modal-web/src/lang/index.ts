import { translate } from "./translate"
import { SupportedLanaugeCodes, TranslationForKey, TranslationKeys } from "./types"

export const DefaultLanguage: SupportedLanaugeCodes = "en"

export interface Translator {
    t: <T extends TranslationKeys>(key: T) => TranslationForKey<T>;
    withLanguage: (lang: SupportedLanaugeCodes) => Translator;
    currentLang: SupportedLanaugeCodes;
  }
  
  export function createInstance(
    defaultLanguage: SupportedLanaugeCodes = DefaultLanguage
  ): Translator {
    const translator = (lang: SupportedLanaugeCodes): Translator => ({
      t: <T extends TranslationKeys>(key: T) => translate(key, lang),
      withLanguage: (newLang: SupportedLanaugeCodes) => translator(newLang),
      currentLang: lang,
    });
  
    return translator(defaultLanguage);
  }