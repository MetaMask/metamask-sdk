import React, { FunctionComponent, ReactNode } from 'react';
import {
  ThemeActions,
  ThemePreferences,
} from '../hooks/use-app-preferences-setup';

interface ThemeProviderProps {
  children: ReactNode;
  preferences: ThemePreferences & ThemeActions;
}

export const PreferencesContext = React.createContext<
  ThemeProviderProps['preferences'] | null
>(null);

export const PreferencesProvider: FunctionComponent<ThemeProviderProps> = ({
  children,
  preferences,
}) => {
  return (
    <PreferencesContext.Provider value={preferences}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = React.useContext(PreferencesContext);
  if (!context) {
    throw new Error('useThemePreferences must be used within a ThemeProvider');
  }
  return context;
};
