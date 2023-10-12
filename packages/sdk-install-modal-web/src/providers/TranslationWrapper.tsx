import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from 'i18next';

const TranslationWrapper = (props: {
  children: React.ReactNode;
  i18nInstance: i18n;
}) => {
  return (
    <I18nextProvider i18n={props.i18nInstance as i18n}>
      {props.children}
    </I18nextProvider>
  );
};

export default TranslationWrapper;
