import { Platform, StyleSheet } from 'react-native';

/**
 * Style sheet function for NetworkSelector screen.
 * @returns StyleSheet object.
 */
const styleSheet = StyleSheet.create({
  addNetworkButton: {
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'android' ? 16 : 0,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  networkCell: {
    alignItems: 'center',
  },
});

export default styleSheet;
