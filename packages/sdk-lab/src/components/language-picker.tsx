import React from 'react';
import { useSDKConfig } from '@metamask/sdk-react';

export const LanguagePicker = () => {
  const { lang, setAppContext } = useSDKConfig();
  const languages = ['en', 'fr', 'it', 'es', 'pt', 'tr', 'he'];

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    localStorage.setItem('MetaMaskSDKLng', event.target.value);
    setAppContext({ lang: event.target.value });
  };

  return (
    <div
      className="language-dropdown"
      style={{ display: 'inline-block', paddingRight: 5 }}
    >
      <select
        id="language-select"
        style={{ padding: 5 }}
        value={lang}
        onChange={handleLanguageChange}
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
};
