/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {MetaMaskSDK} from '@metamask/sdk-react';
import React, {useEffect} from 'react';

import {AppState, AppStateStatus, LogBox, Text, View} from 'react-native';
// import { StorageManagerAS } from './src/StorageManagerAS';

LogBox.ignoreLogs([
  'Possible Unhandled Promise Rejection',
  'Message ignored because invalid key exchange status',
  "MetaMask: 'ethereum._metamask' exposes",
  '`new NativeEventEmitter()` was called with a non-null',
]); // Ignore log notification by message

// TODO how to properly make sure we only try to open link when the app is active?
// current problem is that sdk declaration is outside of the react scope so I cannot directly verify the state
// hence usage of a global variable.
let canOpenLink = true;

const sdk = new MetaMaskSDK({
  dappMetadata: {
    name: 'reactNativeDemo',
  },
});
console.log('sdk found', sdk);

export const SafeApp = () => {
  const handleAppState = (appState: AppStateStatus) => {
    canOpenLink = appState === 'active';
    console.debug(`AppState change: ${appState} canOpenLink=${canOpenLink}`);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View>
      <Text>Hello World</Text>
    </View>
  );
};
