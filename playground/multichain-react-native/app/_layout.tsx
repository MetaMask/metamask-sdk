import 'react-native-get-random-values';
import { SDKProvider } from '../src/sdk/SDKProvider';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const performCleanStartIfNeeded = async () => {
      try {
        // Check for the environment variable to trigger a hard reset
        if (process.env.EXPO_PUBLIC_CLEAR_STORAGE === 'true') {
          console.log('[Hard Reset] Wiping all data from AsyncStorage...');
          await AsyncStorage.clear();
          console.log('[Hard Reset] AsyncStorage has been cleared successfully.');
        }
      } catch (e) {
        console.error('[Hard Reset] Failed to clear AsyncStorage.', e);
      } finally {
        // Hide the splash screen once the storage check is complete
        await SplashScreen.hideAsync();
      }
    };

    performCleanStartIfNeeded();
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  return (
    <SDKProvider>
      <Slot />
    </SDKProvider>
  );
}
