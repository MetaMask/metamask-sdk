/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {useSDK} from '@metamask/sdk-react-native';
import {encrypt} from 'eciesjs';
import React, {useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import packageJSON from '../../package.json';
import {DAPPView} from '../views/DappView';

export function DemoScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [encryptionTime, setEncryptionTime] = useState<number>();
  const {sdk} = useSDK();

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
          style={{
            marginTop: 30,
            backgroundColor: Colors.white,
          }}>
          <Text
            style={{
              color: Colors.black,
              fontSize: 22,
              textAlign: 'center',
              margin: 3,
            }}>
            React Native SDK - Test Dapp
          </Text>
          <Text
            style={{
              color: Colors.black,
              fontSize: 22,
              textAlign: 'center',
              margin: 3,
            }}>
            ( RN{' '}
            {`v${packageJSON.dependencies['react-native']
              .trim()
              .replaceAll('\n', '')}`}
            )
          </Text>
          <Button title="Test Encryption" onPress={testEncrypt} />
          <Text style={{color: Colors.black}}>
            {encryptionTime && `Encryption time: ${encryptionTime} ms`}
          </Text>
          <DAPPView />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
