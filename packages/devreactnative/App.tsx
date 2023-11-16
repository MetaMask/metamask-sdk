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
  View,
  useColorScheme,
} from 'react-native';

import {COMM_SERVER_URL, INFURA_API_KEY} from '@env';
import {DEFAULT_SERVER_URL, MetaMaskSDKOptions} from '@metamask/sdk';
import {MetaMaskProvider, useSDK} from '@metamask/sdk-react';
import {DemoScreen, FABAccount} from '@metamask/sdk-ui';
import {encrypt} from 'eciesjs';
import {LogBox} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import packageJSON from './package.json';
import {DAPPView} from './src/views/DappView';

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
    url: 'devreactnative',
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

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [encryptionTime, setEncryptionTime] = useState<number>();
  const {sdk} = useSDK();

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

  if (!sdk) {
    return <Text>SDK loading</Text>;
  }

  const backgroundStyle = {
    backgroundColor: Colors.lighter,
    flex: 1,
  };

  const testEncrypt = async () => {
    // const privateKey =
    //   '0x131ded88ca58162376374eecc9f74349eb90a8fc9457466321dd9ce925beca1a';
    console.debug('begin encryption test');
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
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            marginTop: 30,
            backgroundColor: Colors.white,
          }}>
          <Text style={{color: Colors.black, fontSize: 24}}>
            devreactnative Mobile Dapp Test ( RN{' '}
            {`v${packageJSON.dependencies['react-native']
              .trim()
              .replaceAll('\n', '')}`}
            )
          </Text>
          <Text>ServerUrl: {serverUrl}</Text>
          <Text>INFURA KEY: {INFURA_API_KEY}</Text>
          <Button title="TestEncrypt" onPress={testEncrypt} />
          <Text style={{color: Colors.black}}>
            {encryptionTime && `Encryption time: ${encryptionTime} ms`}
          </Text>
          <DAPPView />
        </View>
        <View style={styles.sectionContainer}>
          <DemoScreen />
        </View>
      </ScrollView>
      <FABAccount />
    </SafeAreaView>
  );
}

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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export const SafeApp = () => {
  return (
    <MetaMaskProvider sdkOptions={sdkOptions} debug={true}>
      <SafeAreaProvider>
        <App />
      </SafeAreaProvider>
    </MetaMaskProvider>
  );
};
