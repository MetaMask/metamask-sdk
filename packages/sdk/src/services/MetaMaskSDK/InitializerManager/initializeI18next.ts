import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from '../../../locales/en.json';
import es from '../../../locales/es.json';
import fr from '../../../locales/fr.json';
import he from '../../../locales/he.json';
import it from '../../../locales/it.json';
import pt from '../../../locales/pt.json';
import tr from '../../../locales/tr.json';
import { MetaMaskSDK } from '../../../sdk';

/**
 * Initializes the internationalization (i18n) settings for the MetaMask SDK instance.
 *
 * This function creates a new instance of the i18n object and attaches it to the provided
 * MetaMask SDK instance. It sets up language detection and translations using the `i18next`
 * library along with the `react-i18next` and `i18next-browser-languagedetector` plugins.
 * The function loads translation resources from local JSON files and configures language
 * detection preferences, prioritizing the language stored in `localStorage` if present.
 *
 * @param instance The MetaMaskSDK instance which requires i18n setup.
 * @returns A Promise that resolves when the i18n settings have been successfully initialized.
 * @throws Error if the initialization process encounters an error.
 */
export async function initializeI18next(instance: MetaMaskSDK) {
  const i18nOptions = instance.options.i18nOptions ?? {};

  const isEnabled = i18nOptions.enabled;

  await instance.i18nInstance
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      debug: i18nOptions.debug ?? false,
      compatibilityJSON: 'v3',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      resources: isEnabled
        ? {
            en: {
              translation: en,
            },
            es: {
              translation: es,
            },
            it: {
              translation: it,
            },
            fr: {
              translation: fr,
            },
            pt: {
              translation: pt,
            },
            tr: {
              translation: tr,
            },
            he: {
              translation: he,
            },
          }
        : {
            en: {
              translation: en,
            },
          },
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: 'MetaMaskSDKLng',
        caches: ['localStorage'],
      },
    });

  instance.availableLanguages = Object.keys(
    instance.i18nInstance.services.resourceStore.data ?? {},
  );
}
