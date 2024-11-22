interface I18nInstance {
  t: (key: string) => string;
  init: (config: { fallbackLng: string }) => Promise<void>;
}

interface TranslationDict {
  [key: string]: string | TranslationDict;
}

const en = {
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
}

export class SimpleI18n implements I18nInstance {
  private translations: TranslationDict = {};

  constructor() {}

  async loadTranslations(locale: string): Promise<void> {
    // try {
    //   const module = await import(`../../locales/${locale}.json`);
    //   this.translations = module.default;
    // } catch (e) {
    //   console.warn(`Failed to load translations for ${locale}, falling back to en`);
    //   if (locale !== 'en') {
    //     await this.loadTranslations('en');
    //   } else {
    //     // If even English fails to load, use empty translations
    //     this.translations = {};
    //   }
    // }
    console.log(`loading translations for ${locale}`);
    this.translations = en;
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
