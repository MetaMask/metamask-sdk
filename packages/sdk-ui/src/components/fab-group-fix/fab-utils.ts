import color from 'color';
import { MD2Theme, MD3Theme } from 'react-native-paper';
export type InternalTheme = MD2Theme | MD3Theme;

const getLabelColor = ({ theme }: { theme: InternalTheme }) => {
  if (theme.isV3) {
    return theme.colors.onSurface;
  }

  if (theme.dark) {
    return theme.colors.text;
  }

  return color(theme.colors.text).fade(0.54).rgb().string();
};

const getBackdropColor = ({
  theme,
  customBackdropColor,
}: {
  theme: InternalTheme;
  customBackdropColor?: string;
}) => {
  if (customBackdropColor) {
    return customBackdropColor;
  }
  if (theme.isV3) {
    return color(theme.colors.background).alpha(0.95).rgb().string();
  }
  return theme.colors?.backdrop;
};

const getStackedFABBackgroundColor = ({ theme }: { theme: InternalTheme }) => {
  if (theme.isV3) {
    return theme.colors.elevation.level3;
  }
  return theme.colors.surface;
};

export const getFABGroupColors = ({
  theme,
  customBackdropColor,
}: {
  theme: InternalTheme;
  customBackdropColor?: string;
}) => {
  return {
    labelColor: getLabelColor({ theme }),
    backdropColor: getBackdropColor({ theme, customBackdropColor }),
    stackedFABBackgroundColor: getStackedFABBackgroundColor({ theme }),
  };
};
