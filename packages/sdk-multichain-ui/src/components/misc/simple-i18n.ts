interface I18nInstance {
  t: (key: string) => string;
  init: (config: { fallbackLng: string }) => Promise<void>;
}

interface TranslationDict {
  [key: string]: string | TranslationDict;
}

const defaultTranslations: TranslationDict = {

  /**
   * In use
   */
  "CONNECT_WITH_METAMASK": "Connect with Metamask",
  "USE_EXTENSION": "Use extension",
  "USE_MOBILE":"Use mobile",
  "ONE_CLICK_CONNECT": "Connect in one click to the MetaMask extension.",
  "CONNECT_WITH_EXTENSION": "Connect With Extension",
  "SCAN_TO_CONNECT": "Scan to connect with the MetaMask mobile app.",
  /**
   * In use
   */

  "DESKTOP": "Desktop",
  "MOBILE": "Mobile",
  "META_MASK_MOBILE_APP": "MetaMask mobile app",
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

    // Check if English is one of the preferred languages
    const hasEnglish = browserLanguages.some(lang =>
      lang.toLowerCase().startsWith('en')
    );

    // If user understands English, use it
    if (hasEnglish) {
      return 'en';
    }

    // Otherwise, check for other supported languages
    const primaryLang = navigator.language;
    const shortLang = primaryLang.toLowerCase().split('-')[0];
    if (this.supportedLocales.includes(shortLang)) {
      return shortLang;
    }

    return 'en';
  }

  async init(config: { fallbackLng: string }): Promise<void> {
    const browserLang = this.getBrowserLanguage();
    const locale = browserLang || config.fallbackLng;
    await this.loadTranslations(locale);
  }

  async loadTranslations(locale: string): Promise<void> {
    const shortLocale = locale.split('-')[0];

    if (shortLocale === 'en' || !this.supportedLocales.includes(shortLocale)) {
        this.translations = defaultTranslations;
        return;
    }

    try {
        const url = `${this.baseUrl}/${shortLocale}.json`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        this.translations = await response.json();
    } catch (error) {
        console.warn(`❌ Failed to load ${shortLocale} translations, falling back to English:`, error);
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
