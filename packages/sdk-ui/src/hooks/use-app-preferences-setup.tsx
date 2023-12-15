import { useEffect, useMemo, useState } from 'react';
import { I18nextProviderProps } from 'react-i18next';
import { Theme } from '../theme/models';
import { SavedUserPreferences } from './use-app-theme-setup';

interface useThemePreferencesProps {
  theme: Theme;
  i18nInstance: I18nextProviderProps['i18n'];
  savedPreferences?: SavedUserPreferences;
  savePreferences?: (userPrefs: SavedUserPreferences) => void;
  setDarkMode: (value: boolean | ((oldValue: boolean) => boolean)) => void;
  setThemeVersion: (number: number) => void;
}

export interface ThemeActions {
  toggleShouldUseDeviceColors?: () => void;
  toggleDarkMode: () => void;
  toggleThemeVersion: () => void;
  toggleCollapsed: () => void;
  toggleCustomFont?: () => void;
  toggleRippleEffect: () => void;
  setThemeColor: (props: { name: string; value: string }) => void;
}

export interface ThemePreferences {
  customFontLoaded: boolean;
  rippleEffectEnabled: boolean;
  collapsed: boolean;
  darkMode: boolean;
  shouldUseDeviceColors?: boolean;
}

export const useAppPreferencesSetup = ({
  theme,
  i18nInstance,
  savePreferences,
  setDarkMode,
}: useThemePreferencesProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [customFontLoaded, setCustomFont] = useState(false);
  const [rippleEffectEnabled, setRippleEffectEnabled] = useState(true);
  const [dynamicTheme, setDynamicTheme] = useState<Theme>(theme);
  const logger = console; // TODO: use logger hook
  const [listener, setListener] = useState(false);

  useEffect(() => {
    setDynamicTheme(theme);
  }, [theme, dynamicTheme]);

  useEffect(() => {
    const onLanguage = (lng: string) => {
      logger.debug(`language changed to ${lng}`);
      savePreferences?.({
        darkMode: false,
        rippleEffectEnabled,
        locale: lng,
      });
    };

    if (!listener && i18nInstance.isInitialized) {
      logger.debug('setting up i18n listener');
      i18nInstance.on('languageChanged', onLanguage);
      setListener(true);
    }

    return () => {};
  }, [
    i18nInstance,
    savePreferences,
    listener,
    logger,
    dynamicTheme,
    rippleEffectEnabled,
  ]);

  const preferences: ThemeActions & ThemePreferences = useMemo(
    () => ({
      toggleDarkMode: () => {
        const newValue = false;
        setDarkMode(newValue);
        savePreferences?.({
          darkMode: newValue,
          rippleEffectEnabled,
          locale: i18nInstance.language,
        });
      },
      toggleCollapsed: () => setCollapsed(!collapsed),
      toggleCustomFont: () => setCustomFont(!customFontLoaded),
      toggleRippleEffect: () => {
        setRippleEffectEnabled((oldValue) => {
          savePreferences?.({
            darkMode: false,
            rippleEffectEnabled: !oldValue,
            locale: i18nInstance.language,
          });
          return !oldValue;
        });
      },
      setThemeColor: ({ name, value }: { name: string; value: string }) => {
        setDynamicTheme((oldTheme) => {
          const newTheme = {
            ...oldTheme,
            colors: {
              ...oldTheme.colors,
              [name]: value,
            },
          };
          return newTheme;
        });
      },
      toggleThemeVersion: () => {},
      customFontLoaded,
      rippleEffectEnabled,
      collapsed,
      darkMode: false,
      theme: dynamicTheme,
    }),
    [
      dynamicTheme,
      collapsed,
      i18nInstance,
      savePreferences,
      customFontLoaded,
      rippleEffectEnabled,
      setDarkMode,
    ],
  );

  return preferences;
};
