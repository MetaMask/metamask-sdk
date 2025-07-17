import androidOpenWithComponent from '@screens/Android/components/AndroidOpenWithComponent';
import iOSOpenInComponent from '@screens/iOS/components/IOSOpenInComponent';
import bottomNavigationComponent from '@screens/MetaMask/components/BottomNavigationComponent';
import settingsScreen from '@screens/MetaMask/SettingsScreen';
import { PLATFORM, Platforms } from '@util/constants';

/**
 * Clears all connections from the MetaMask app
 * @returns void
 */
export const clearAllConnections = async () => {
  try {
    await bottomNavigationComponent.tapSettingsButton();
    await settingsScreen.clearAllConnections();
    await bottomNavigationComponent.tapHomeButton();
  } catch (e) {
    console.log('No Connections to clear', e.message);
  }
};

/**
 * Opens the MetaMask app with the given platform
 * @returns void
 */
export const deviceOpenDeeplinkWithMetaMask = async () => {
  if (PLATFORM === Platforms.IOS) {
    await iOSOpenInComponent.tapOpen();
  } else {
    await androidOpenWithComponent.tapOpenWithMetaMask();
  }
};
