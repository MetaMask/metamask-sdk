/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {INFURA_API_KEY} from '@env';
import {
  MetaMaskProvider,
  SDKConfigProvider,
  useSDKConfig,
} from '@metamask/sdk-react-native';
import React, {useEffect} from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {AppState, AppStateStatus, LogBox, NativeModules} from 'react-native';
import RootNavigator from './src/RootNavigator';

if (!NativeModules.MetaMaskReactNativeSdk) {
  console.debug(
    '❌ MetaMaskReactNativeSdk not found. Check native module linking.',
  );
} else {
  console.debug('✅ MetaMaskReactNativeSdk found:');
}

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

const WithSDKConfig = ({children}: {children: React.ReactNode}) => {
  const {dappName, dappUrl, dappIconUrl, dappScheme} = useSDKConfig();

  return (
    <MetaMaskProvider
      sdkOptions={{
        dappName,
        dappUrl,
        dappIconUrl,
        dappScheme,
      }}>
      {children}
    </MetaMaskProvider>
  );
};

export const SafeApp = () => {
  const navigationRef = useNavigationContainerRef();

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

  const handleNavReady = () => {
    console.log('Navigation container ready!');
  };

  return (
    <SDKConfigProvider initialInfuraKey={INFURA_API_KEY}>
      <WithSDKConfig>
        <NavigationContainer ref={navigationRef} onReady={handleNavReady}>
          <RootNavigator />
        </NavigationContainer>
      </WithSDKConfig>
    </SDKConfigProvider>
  );
};
