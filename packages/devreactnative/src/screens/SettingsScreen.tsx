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
  View,
  useColorScheme,
} from 'react-native';

import {useSDK} from '@metamask/sdk-react';
import {FloatingMetaMaskButton} from '@metamask/sdk-ui';
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
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            marginTop: 30,
            backgroundColor: Colors.white,
          }}>
          <Text>Settings HERE</Text>
        </View>
      </ScrollView>
      <FloatingMetaMaskButton />
    </SafeAreaView>
  );
}
