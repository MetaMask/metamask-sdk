/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import {INFURA_API_KEY} from '@env';
import {MetaMaskProvider, SDKConfigProvider} from '@metamask/sdk-react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {AppState, AppStateStatus, LogBox} from 'react-native';
import RootNavigator from './src/RootNavigator';

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

const SafeApp = () => {
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
      <MetaMaskProvider
        sdkOptions={{
          dappMetadata: {
            name: 'Test Dapp',
            url: 'https://metamask.github.io/test-dapp/',
            iconUrl:
              'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png',
            scheme: 'testdapp',
          },
          infuraAPIKey: '#########',
        }}>
        <NavigationContainer ref={navigationRef} onReady={handleNavReady}>
          <RootNavigator />
        </NavigationContainer>
      </MetaMaskProvider>
    </SDKConfigProvider>
  );
};

export default SafeApp;
