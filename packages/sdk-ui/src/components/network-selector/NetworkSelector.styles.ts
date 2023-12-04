import { Platform, StyleSheet } from 'react-native';

/**
 * Style sheet function for NetworkSelector screen.
 * @returns StyleSheet object.
 */
const styleSheet = StyleSheet.create({
  mainContainer: { flex: 1, width: '100%' },
  addNetworkButton: {
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'android' ? 16 : 0,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 5,
    height: 25,
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
