import React, { useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ThemeActions,
  ThemePreferences,
} from '../hooks/use-app-preferences-setup';
import { LanguageProvider } from './language-provider';
import { PreferencesProvider, usePreferences } from './preferences-provider';
import { ThemeContext } from '../theme';
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from '@metamask/design-tokens';

export const WithPreferences = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const preferences = usePreferences();
  return (
    <PaperProvider
      // theme={preferences.theme}
      settings={{
        rippleEffectEnabled: preferences.rippleEffectEnabled,
      }}
    >
      <ThemeContext.Provider value={lightTheme}>
        {children}
      </ThemeContext.Provider>
    </PaperProvider>
  );
};

export const UIProvider = ({
  locale,
  preferences,
  children,
}: {
  children: React.ReactNode;
  preferences?: Partial<ThemePreferences & ThemeActions>;
  locale?: string;
}) => {
  // Set default Preferences
  const activePreferences: ThemePreferences & ThemeActions = useMemo(() => {
    return {
      customFontLoaded: true,
      collapsed: false,
      darkMode: false,
      rippleEffectEnabled: true,
      toggleCustomFont: () => {},
      toggleDarkMode: () => {},
      toggleThemeVersion: () => {},
      toggleRippleEffect: () => {},
      setThemeColor: () => {},
      toggleCollapsed: () => {},
      ...preferences,
    };
  }, [preferences]);

  return (
    <SafeAreaProvider>
      <LanguageProvider locale={locale}>
        <PreferencesProvider preferences={activePreferences}>
          <WithPreferences>{children}</WithPreferences>
        </PreferencesProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
};
