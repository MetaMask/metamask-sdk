import i18n from 'i18next';
import React, { useEffect } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

const resources = {
  en: {
    // TODO add translations
  },
};

export const LanguageProvider = ({
  locale,
  children,
}: {
  children: React.ReactNode;
  locale?: string;
}) => {
  const logger = console; // TODO useLoggerActions('useI18nSetup');

  useEffect(() => {
    if (!i18n.isInitialized) {
      const lng = locale ?? 'en';
      logger.info(`initializing i18n device: lng=${lng} locale=${locale}`);
      i18n
        .use(initReactI18next)
        .init({
          fallbackLng: 'en',
          compatibilityJSON: 'v3',
          debug: true,
          resources,
          // saveMissingTo: 'all',
          lng,
          defaultNS: 'translations',
          interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
          },
        })
        .then((t) => {
          logger.log('i18n initialized', t('hello'));
        })
        .catch((error) => {
          logger.error('Failed to initialize i18n:', error);
        });
    } else {
      logger.log('i18n already initialized');
    }
  }, [logger, locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
