/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import {useSDK} from '@metamask/sdk-react';
import {FABAccount, Icon} from '@metamask/sdk-ui';
import {
  IconName,
  IconSize,
} from '@metamask/sdk-ui/src/design-system/components/Icons/Icon';
import {encrypt} from 'eciesjs';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import packageJSON from '../package.json';

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

export function App(): JSX.Element {
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
          {/* <Text>INFURA KEY: {INFURA_API_KEY}</Text> */}
          <Button title="TestEncrypt" onPress={testEncrypt} />
          <Text style={{color: Colors.black}}>
            {encryptionTime && `Encryption time: ${encryptionTime} ms`}
          </Text>
          {/* <DAPPView /> */}
        </View>
        <View style={styles.sectionContainer}>
          {/* <PreviewScreen /> */}
          <Icon size={IconSize.XXL} name={IconName.Add} />
          <FAIcon name="rocket" size={50} color="#900" />
          {/* <Image source={assets.ethereum} style={{width: 32, height: 32}} /> */}
        </View>
      </ScrollView>
      <FABAccount />
    </SafeAreaView>
  );
}
