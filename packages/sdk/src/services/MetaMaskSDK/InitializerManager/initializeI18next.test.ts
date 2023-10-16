import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { MetaMaskSDK } from '../../../sdk';
import { initializeI18next } from './initializeI18next';

jest.mock('../../../sdk');
jest.mock('i18next', () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  initReactI18next: jest.fn(),
}));

jest.mock('i18next-browser-languagedetector', () => jest.fn());

describe('initializeI18next', () => {
  const mockI18nUse = jest.fn().mockReturnThis();
  const mockI18nInit = jest.fn();

  const mockMetaMaskSDKInstance = {
    i18nInstance: {
      use: mockI18nUse,
      init: mockI18nInit,
      services: {
        resourceStore: {
          data: {
            en: {},
            es: {},
            fr: {},
            he: {},
            it: {},
            pt: {},
            tr: {},
          },
        },
      },
    },
    options: {
      i18nOptions: { enabled: true },
    },
  } as unknown as MetaMaskSDK;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMetaMaskSDKInstance.options = {
      i18nOptions: { enabled: true },
    } as unknown as MetaMaskSDK['options'];
  });

  it('should call i18n.use and i18n.init with correct arguments', async () => {
    await initializeI18next(mockMetaMaskSDKInstance);

    expect(mockI18nUse).toHaveBeenCalledWith(initReactI18next);
    expect(mockI18nUse).toHaveBeenCalledWith(LanguageDetector);
    expect(mockI18nInit).toHaveBeenCalledWith(
      expect.objectContaining({
        debug: false,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        resources: expect.objectContaining({
          en: expect.any(Object),
          es: expect.any(Object),
          fr: expect.any(Object),
          he: expect.any(Object),
          it: expect.any(Object),
          pt: expect.any(Object),
          tr: expect.any(Object),
        }),
        detection: expect.objectContaining({
          order: ['localStorage', 'navigator'],
          lookupLocalStorage: 'MetaMaskSDKLng',
          caches: ['localStorage'],
        }),
      }),
    );
  });

  it('should set availableLanguages on the MetaMaskSDK instance', async () => {
    await initializeI18next(mockMetaMaskSDKInstance);

    expect(mockMetaMaskSDKInstance.availableLanguages).toStrictEqual(
      expect.arrayContaining(['en', 'es', 'fr', 'he', 'it', 'pt', 'tr']),
    );
  });
});
