/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  AppState,
  AppStateStatus,
  Button,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {LogBox} from 'react-native';

import {MetaMaskSDK} from '@metamask/sdk';
import {
  CommunicationLayerMessage,
  CommunicationLayerPreference,
  DappMetadata,
  MessageType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import BackgroundTimer from 'react-native-background-timer';

const remotServerUrl = 'http://192.168.50.114:4000';

LogBox.ignoreLogs([
  //'Possible Unhandled Promise Rejection'
]); // Ignore log notification by message

// TODO how to properly make sure we only try to open link when the app is active?
// current problem is that sdk declaration is outside of the react scope so I cannot directly verify the state
// hence usage of a global variable.
let canOpenLink = true;

const sdk = new MetaMaskSDK({
  openDeeplink: (link: string) => {
    if (canOpenLink) {
      console.debug(`App::openDeepLink() ${link}`);
      Linking.openURL(link);
    } else {
      console.debug(
        'useBlockchainProiver::openDeepLink app is not active - skip link',
        link,
      );
    }
  },
  // communicationServerUrl: remotServerUrl,
  checkInstallationOnAllCalls: false,
  timer: BackgroundTimer,
  enableDebug: true,
  dappMetadata: {
    url: 'Test1',
    name: 'Test1',
  },
  storage: {
    debug: true,
    // storageManager: new StorageManagerRN({debug: true}),
  },
  autoConnect: {
    enable: false,
  },
  logging: {
    developerMode: true,
  },
  ecies: {
    enabled: true,
    debug: true,
  },
});


function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Text>oasdfask</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
