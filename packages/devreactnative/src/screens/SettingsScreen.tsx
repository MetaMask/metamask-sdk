/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';

import {useSDK} from '@metamask/sdk-react';
import {FloatingMetaMaskButton, SDKConfig} from '@metamask/sdk-ui';
import {Colors} from 'react-native/Libraries/NewAppScreen';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = StyleSheet.create({});

export function SettingsScreen(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const {sdk} = useSDK();

  if (!sdk) {
    return <Text>SDK loading</Text>;
  }

  const backgroundStyle = {
    backgroundColor: Colors.lighter,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <SDKConfig showQRCode={true} />
      </ScrollView>
      <FloatingMetaMaskButton />
    </SafeAreaView>
  );
}
