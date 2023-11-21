/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';

import {COMM_SERVER_URL, INFURA_API_KEY} from '@env';
import {DEFAULT_SERVER_URL, MetaMaskSDKOptions} from '@metamask/sdk';
import {MetaMaskProvider} from '@metamask/sdk-react';
import {UIProvider} from '@metamask/sdk-ui';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {AppState, AppStateStatus, Linking, LogBox} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
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
const serverUrl = COMM_SERVER_URL ?? DEFAULT_SERVER_URL;

const useDeeplink = true;

const sdkOptions: MetaMaskSDKOptions = {
  openDeeplink: (link: string, _target?: string) => {
    console.debug(`App::openDeepLink() ${link}`);
    if (canOpenLink) {
      Linking.openURL(link);
    } else {
      console.debug(
        'useBlockchainProiver::openDeepLink app is not active - skip link',
        link,
      );
    }
  },
  // Replace with local socket server for dev debug
  // Android will probably require https, so use ngrok or edit react_native_config.xml to allow http.
  communicationServerUrl: serverUrl,
  checkInstallationOnAllCalls: false,
  infuraAPIKey: INFURA_API_KEY ?? undefined,
  timer: BackgroundTimer,
  enableDebug: true,
  useDeeplink,
  dappMetadata: {
    name: 'devreactnative',
  },
  storage: {
    enabled: true,
    // storageManager: new StorageManagerRN({debug: true}),
  },
  logging: {
    developerMode: true,
    plaintext: true,
  },
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
    <MetaMaskProvider sdkOptions={sdkOptions} debug={true}>
      <UIProvider>
        <NavigationContainer ref={navigationRef} onReady={handleNavReady}>
          <RootNavigator />
        </NavigationContainer>
      </UIProvider>
    </MetaMaskProvider>
  );
};
