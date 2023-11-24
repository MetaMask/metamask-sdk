import { darkTheme, lightTheme } from '@metamask/design-tokens';
import React, { useContext, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, {
  ToastContext,
  ToastContextWrapper,
} from '../design-system/components/Toast';
import {
  ThemeActions,
  ThemePreferences,
} from '../hooks/use-app-preferences-setup';
import { ThemeContext } from '../theme';
import { LanguageProvider } from './language-provider';
import { PreferencesProvider, usePreferences } from './preferences-provider';

export const WithToasts = ({ children }: { children: React.ReactNode }) => {
  const { toastRef } = useContext(ToastContext);

  return (
    <>
      {children}
      <Toast ref={toastRef} />
    </>
  );
};

export const WithPreferences = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const preferences = usePreferences();
  console.log(`WithPreferences::lightTheme`, lightTheme);
  return (
    <PaperProvider
      // theme={preferences.theme}
      settings={{
        rippleEffectEnabled: preferences.rippleEffectEnabled,
      }}
    >
      <ThemeContext.Provider
        value={preferences.darkMode ? darkTheme : lightTheme}
      >
        <ToastContextWrapper>{children}</ToastContextWrapper>
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
  const [darkMode, setDarkMode] = React.useState(false);

  // Set default Preferences
  const activePreferences: ThemePreferences & ThemeActions = useMemo(() => {
    return {
      darkMode,
      customFontLoaded: true,
      collapsed: false,
      rippleEffectEnabled: true,
      toggleCustomFont: () => {},
      toggleDarkMode: () => {
        setDarkMode((oldValue) => !oldValue);
      },
      toggleThemeVersion: () => {},
      toggleRippleEffect: () => {},
      setThemeColor: () => {},
      toggleCollapsed: () => {},
      ...preferences,
    };
  }, [preferences, darkMode]);

  return (
    <SafeAreaProvider>
      <LanguageProvider locale={locale}>
        <PreferencesProvider preferences={activePreferences}>
          {/* eslint-disable-next-line react-native/no-inline-styles  */}
          <GestureHandlerRootView style={{ flex: 1 }}>
            <WithPreferences>
              <WithToasts>{children}</WithToasts>
            </WithPreferences>
          </GestureHandlerRootView>
        </PreferencesProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
};
