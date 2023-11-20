// Third party dependencies.
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { darkTheme } from '@metamask/design-tokens';

const { colors } = darkTheme;
const marginWidth = 16;
const padding = 16;
const toastWidth = Dimensions.get('window').width - marginWidth * 2;

/**
 * Style sheet for Toast component.
 *
 * @returns StyleSheet object.
 */
const styleSheet = StyleSheet.create({
  base: {
    position: Platform.OS === 'web' ? 'fixed' : ('absolute' as any),
    width: toastWidth,
    left: marginWidth,
    bottom: 0,
    backgroundColor: colors.background.alternative,
    borderRadius: 4,
    padding,
    flexDirection: 'row',
    zIndex: 9999,
  },
  avatar: {
    marginRight: 8,
  },
  labelsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    color: colors.text.default,
  },
});

export default styleSheet;
