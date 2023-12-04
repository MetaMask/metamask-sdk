// hooks/useAppTheme.ts
import { useEffect, useState } from 'react';
import { configureFonts } from 'react-native-paper';

export interface SavedUserPreferences {
  darkMode: boolean;
  locale?: string;
  rippleEffectEnabled: boolean;
}

export const useAppThemeSetup = ({
  fontFamily,
  savedPreferences,
}: {
  fontFamily?: string;
  savedPreferences?: SavedUserPreferences; // if set will override the theme
}) => {
  const [darkMode, setDarkMode] = useState(savedPreferences?.darkMode ?? false);
  const [themeVersion, setThemeVersion] = useState<number>(3);

  useEffect(() => {
    if (savedPreferences) {
      setDarkMode(savedPreferences.darkMode);
    }
  }, [savedPreferences]);

  const configuredFontTheme = {
    fonts: fontFamily
      ? configureFonts({
          config: {
            fontFamily,
          },
        })
      : undefined,
  };

  return {
    configuredFontTheme,
    darkMode,
    locale: savedPreferences?.locale,
    setDarkMode,
    themeVersion,
    setThemeVersion,
  };
};
