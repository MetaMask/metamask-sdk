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
export declare function initializeI18next(instance: MetaMaskSDK): Promise<void>;
//# sourceMappingURL=initializeI18next.d.ts.map