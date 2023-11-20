// Third party dependencies.
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// External dependencies.
import { useStyles } from '../../../hooks/useStyles';

// Internal dependencies.
import { IconProps, IconColor, IconName } from './Icon.types';
import styleSheet from './Icon.styles';
import { assetByIconName } from './Icon.assets';
import { DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR } from './Icon.constants';
import { Platform, View } from 'react-native';

const Icon = ({
  size = DEFAULT_ICON_SIZE,
  style,
  name,
  color = DEFAULT_ICON_COLOR,
  ...props
}: IconProps) => {
  const { styles, theme } = useStyles(styleSheet, {
    size,
    style,
    color,
  });

  const SVG = assetByIconName[name];
  const sizeAsNum = Number(size);
  let iconColor;
  switch (color) {
    case IconColor.Default:
      iconColor = theme.colors.icon.default;
      break;
    case IconColor.Inverse:
      iconColor = theme.colors.primary.inverse;
      break;
    case IconColor.Alternative:
      iconColor = theme.colors.icon.alternative;
      break;
    case IconColor.Muted:
      iconColor = theme.colors.icon.muted;
      break;
    case IconColor.Primary:
      iconColor = theme.colors.primary.default;
      break;
    case IconColor.PrimaryAlternative:
      iconColor = theme.colors.primary.alternative;
      break;
    case IconColor.Success:
      iconColor = theme.colors.success.default;
      break;
    case IconColor.Error:
      iconColor = theme.colors.error.default;
      break;
    case IconColor.ErrorAlternative:
      iconColor = theme.colors.error.alternative;
      break;
    case IconColor.Warning:
      iconColor = theme.colors.warning.default;
      break;
    case IconColor.Info:
      iconColor = theme.colors.info.default;
      break;
    default:
      iconColor = color;
  }

  if (name === IconName.Logout) {
    return (
      <MaterialCommunityIcons
        name="logout"
        size={sizeAsNum}
        color={iconColor}
      />
    );
  }

  if (!SVG || (typeof SVG !== 'function' && Platform.OS === 'web')) {
    // Fallback mechanism for web
    // if this condition is met you probably need to configure webpack svgr loader
    console.error(
      `Icon for name "${name}" not found or is not a valid React component. Please check if you have configured webpack svgr loader correctly.`,
      SVG,
    );
    return (
      <View
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          width: sizeAsNum,
          height: sizeAsNum,
          borderWidth: 1,
          backgroundColor: iconColor,
        }}
      />
    );
  }

  return (
    <SVG
      color={iconColor}
      style={{ ...styles.icon, height: sizeAsNum, width: sizeAsNum }}
      width={sizeAsNum}
      height={sizeAsNum}
      viewBox={`0 0 ${sizeAsNum} ${sizeAsNum}`}
      // This prop it's for testing purposes
      name={name}
      {...props}
    />
  );
};

export default Icon;
