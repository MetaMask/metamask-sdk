interface I18nInstance {
  t: (key: string) => string;
  init: (config: { fallbackLng: string }) => Promise<void>;
}

interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export class SimpleI18n implements I18nInstance {
  private translations: TranslationDict = {};

  constructor() {}

  async loadTranslations(locale: string): Promise<void> {
    try {
      const module = await import(`../../locales/${locale}.json`);
      this.translations = module.default;
    } catch (e) {
      console.warn(`Failed to load translations for ${locale}, falling back to en`);
      if (locale !== 'en') {
        await this.loadTranslations('en');
      } else {
        // If even English fails to load, use empty translations
        this.translations = {};
      }
    }
  }

  t(key: string): string {
    return this.getNestedTranslation(key, this.translations) || key;
  }

  private getNestedTranslation(key: string, dict: TranslationDict): string {
    const parts = key.split('.');
    let current: TranslationDict | string = dict;

    for (const part of parts) {
      if (typeof current !== 'object') return '';
      current = current[part];
    }

    return typeof current === 'string' ? current : '';
  }

  async init(config: { fallbackLng: string }): Promise<void> {
    const locale = config.fallbackLng || 'en';
    await this.loadTranslations(locale);
  }
}
