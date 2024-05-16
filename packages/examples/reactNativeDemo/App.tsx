/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {COMM_SERVER_URL, INFURA_API_KEY} from '@env';
import {
  MetaMaskProvider,
  SDKConfigProvider,
  useSDKConfig,
} from '@metamask/sdk-react';
import * as RN_SDK from '@metamask/sdk-react-native';
import React, {useEffect} from 'react';

import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {
  AppState,
  AppStateStatus,
  Linking,
  LogBox,
  NativeModules,
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import RootNavigator from './src/RootNavigator';

if (!NativeModules.MetaMaskReactNativeSdk) {
  console.debug(
    '❌ MetaMaskReactNativeSdk not found. Check native module linking.',
  );
} else {
  console.debug('✅ MetaMaskReactNativeSdk found:');
}

RN_SDK.sampleMethod('TEST INPUT', 10, (output: any) => {
  console.debug('🟠 ~ sampleMethod Output =>', output);
});

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
  const {
    socketServer,
    infuraAPIKey,
    useDeeplink,
    debug,
    checkInstallationImmediately,
  } = useSDKConfig();

  return (
    <MetaMaskProvider
      debug={debug}
      sdkOptions={{
        communicationServerUrl: socketServer,
        // TODO: change to enableAnalytics when updating the SDK version
        enableDebug: true,
        infuraAPIKey,
        readonlyRPCMap: {
          '0x539': process.env.NEXT_PUBLIC_PROVIDER_RPCURL ?? '',
        },
        logging: {
          developerMode: true,
          plaintext: true,
        },
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
        timer: BackgroundTimer,
        useDeeplink,
        checkInstallationImmediately,
        storage: {
          enabled: true,
        },
        dappMetadata: {
          name: 'devreactnative',
        },
        i18nOptions: {
          enabled: true,
        },
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
    <SDKConfigProvider
      initialSocketServer={COMM_SERVER_URL}
      initialInfuraKey={INFURA_API_KEY}>
      <WithSDKConfig>
        <NavigationContainer ref={navigationRef} onReady={handleNavReady}>
          <RootNavigator />
        </NavigationContainer>
      </WithSDKConfig>
    </SDKConfigProvider>
  );
};
