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

import {MetaMaskSDK} from '@metamask/sdk';
import {
  CommunicationLayerMessage,
  CommunicationLayerPreference,
  DappMetadata,
  MessageType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import crypto from 'crypto';
import {encrypt} from 'eciesjs';
import {LogBox} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {DAPPView} from './src/views/DappView';
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
  communicationServerUrl: remotServerUrl,
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
  const [encryptionTime, setEncryptionTime] = useState<number>();

  useEffect(() => {
    console.debug('use effect now');

    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      console.debug('useEffect() unmount');
      subscription.remove();
    };
  }, []);

  const handleAppState = (appState: AppStateStatus) => {
    console.debug(`AppState change: ${appState}`);
    canOpenLink = appState === 'active';
  };

  const backgroundStyle = {
    backgroundColor: Colors.lighter,
  };

  const testEncrypt = async () => {
    // const privateKey =
    //   '0x131ded88ca58162376374eecc9f74349eb90a8fc9457466321dd9ce925beca1a';
    console.debug('begin encryptiion test');
    const startTime = Date.now();

    const data =
      '{"type":"originator_info","originatorInfo":{"url":"example.com","title":"React Native Test Dapp","platform":"NonBrowser"}}';
    const other =
      '024368ce46b89ec6b5e8c48357474b2a8e26594d00cd59ff14753f8f0051706016';
    const payload = Buffer.from(data);
    const encryptedData = encrypt(other, payload);
    const encryptedString = Buffer.from(encryptedData).toString('base64');
    console.debug('encrypted: ', encryptedString);
    const timeSpent = Date.now() - startTime;
    setEncryptionTime(timeSpent);
    console.debug(`encryption time: ${timeSpent} ms`);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            marginTop: 30,
            backgroundColor: Colors.white,
          }}>
          <Text style={{color: Colors.black, fontSize: 24}}>
            TEST1 Mobile Dapp Test (RN v0.71.1)
          </Text>
          <Button title="TestEncrypt" onPress={testEncrypt} />
          <Text style={{color: Colors.black}}>
            {encryptionTime && `Encryption time: ${encryptionTime} ms`}
          </Text>
          <DAPPView sdk={sdk} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
