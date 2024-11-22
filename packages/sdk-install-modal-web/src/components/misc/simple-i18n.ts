interface I18nInstance {
  t: (key: string) => string;
  init: (config: { fallbackLng: string }) => Promise<void>;
}

interface TranslationDict {
  [key: string]: string | TranslationDict;
}

const defaultTranslations: TranslationDict = {
  "DESKTOP": "Desktop",
  "MOBILE": "Mobile",
  "META_MASK_MOBILE_APP": "MetaMask mobile app",
  "SCAN_TO_CONNECT": "Scan to connect and sign with",
  "CONNECT_WITH_EXTENSION": "Connect With MetaMask Extension",
  "INSTALL_MODAL": {
    "TRUSTED_BY_USERS": "Trusted by over 30 million users to buy, store, send and swap crypto securely",
    "LEADING_CRYPTO_WALLET": "The leading crypto wallet & gateway to blockchain apps built on Ethereum Mainnet, Polygon, Optimism, and many other networks",
    "CONTROL_DIGITAL_INTERACTIONS": "Puts you in control of your digital interactions by making power of cryptography more accessible",
    "INSTALL_META_MASK_EXTENSION": "Install MetaMask Extension"
  },
  "PENDING_MODAL": {
    "OPEN_META_MASK_SELECT_CODE": "Please open the MetaMask wallet app and select the code on the screen OR disconnect",
    "OPEN_META_MASK_CONTINUE": "Open the MetaMask app to continue with your session.",
    "NUMBER_AFTER_OPEN_NOTICE": "If a number doesn't appear after opening MetaMask, please click disconnect and re-scan the QRCode.",
    "DISCONNECT": "Disconnect"
  },
  "SELECT_MODAL": {
    "CRYPTO_TAKE_CONTROL_TEXT": "Take control of your crypto and explore the blockchain with the wallet trusted by over 30 million people worldwide"
  },
  "META_MASK_MODAL": {
    "ADDRESS_COPIED": "Address copied to clipboard!",
    "DISCONNECT": "Disconnect",
    "ACTIVE_NETWORK": "Active Network"
  }
} as const;

export class SimpleI18n implements I18nInstance {
  private translations: TranslationDict = defaultTranslations;
  private supportedLocales: string[] = ['es', 'fr', 'he', 'it', 'pt', 'tr'];
  private baseUrl: string;

  constructor(config?: { baseUrl?: string }) {
    this.baseUrl = config?.baseUrl ?? 'https://raw.githubusercontent.com/MetaMask/metamask-sdk/refs/heads/gh-pages/locales';
  }

  private getBrowserLanguage(): string {
    // Get all browser languages in order of preference
    const browserLanguages = navigator.languages || [navigator.language];
    console.log('🌐 Browser languages in order:', browserLanguages);

    // Check if English is one of the preferred languages
    const hasEnglish = browserLanguages.some(lang =>
      lang.toLowerCase().startsWith('en')
    );
    console.log('🇬🇧 English found in language preferences:', hasEnglish);

    // If user understands English, use it
    if (hasEnglish) {
      console.log('✅ Using English as user understands it');
      return 'en';
    }

    // Otherwise, check for other supported languages
    const primaryLang = navigator.language;
    const shortLang = primaryLang.toLowerCase().split('-')[0];
    console.log('🌍 Primary browser language:', primaryLang);
    console.log('🔍 Checking support for:', shortLang);
    console.log('📋 Supported locales:', this.supportedLocales);

    if (this.supportedLocales.includes(shortLang)) {
      console.log(`✅ Found supported language: ${shortLang}`);
      return shortLang;
    }

    // Default to English if no supported language found
    console.log('⚠️ No supported language found, defaulting to English');
    return 'en';
  }

  async init(config: { fallbackLng: string }): Promise<void> {
    const browserLang = this.getBrowserLanguage();
    const locale = config.fallbackLng || browserLang;
    await this.loadTranslations(locale);
  }

  async loadTranslations(locale: string): Promise<void> {
    const shortLocale = locale.split('-')[0];

    if (shortLocale === 'en' || !this.supportedLocales.includes(shortLocale)) {
      this.translations = defaultTranslations;
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${shortLocale}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.translations = await response.json();
      console.log(`Successfully loaded ${shortLocale} translations`);
    } catch (error) {
      console.warn(`Failed to load ${shortLocale} translations, falling back to English:`, error);
      this.translations = defaultTranslations;
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
}
