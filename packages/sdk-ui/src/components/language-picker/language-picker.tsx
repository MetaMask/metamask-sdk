import { useSDKConfig } from '@metamask/sdk-react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Button, Menu } from 'react-native-paper';

export const LanguagePicker = () => {
  const { lang, setAppContext } = useSDKConfig();
  const languages = ['en', 'fr', 'it', 'es', 'pt', 'tr', 'he'];
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleLanguageChange = async (newLang: string) => {
    await AsyncStorage.setItem('MetaMaskSDKLng', newLang);

    setAppContext({ lang: newLang });
    closeMenu();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Button onPress={openMenu}>{lang}</Button>}
    >
      {languages.map((loopLang) => (
        <Menu.Item
          key={loopLang}
          onPress={() => handleLanguageChange(loopLang)}
          title={loopLang}
        />
      ))}
    </Menu>
  );
};
