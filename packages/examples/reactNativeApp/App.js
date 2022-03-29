/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
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
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import crypto from 'crypto';

import MetaMaskSDK from './metamask-sdk.es';

import WC from '@walletconnect/client';

const sdk = new MetaMaskSDK({
  openLink: link => Linking.openURL(link),
  WalletConnectInstance: WC,
});

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};
const ethereum = sdk.getProvider();

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const connect = async () => {
    try {
      const result = await ethereum.request({method: 'eth_requestAccounts'});
      console.log('RESULT', result);
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const exampleRequest = async () => {
    try {
      const result = await ethereum.request({method: 'eth_requestAccounts'});
      console.log('RESULT', result);
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const listenEthereumEvents = () => {
    ethereum.on('accountsChanged', args =>
      console.log('EVENT accountsChanged', args),
    );
    ethereum.on('chainChanged', args =>
      console.log('EVENT chainChanged', args),
    );
  };

  const onMessage = message => {
    //console.log(message.nativeEvent.data);
    const action = JSON.parse(message.nativeEvent.data);
    console.log('NEW MESSAGE', action);
    if (action.method === 'openLink') {
      Linking.openURL(action.link);
    } else if (action.method === 'accountsChanged') {
      ethereum.selectedAddress = action.result?.[0];
      console.log('accountsChanged', action.result);
      ethereum.emit('accountsChanged', action.result);
      return;
    } else if (action.method === 'chainChanged') {
      ethereum.chainId = action.result;
      console.log('chainChanged', action.result);
      ethereum.emit('chainChanged', action.result);
      return;
    }

    const activeRequest = ethereum.activeRequests[action.id];
    if (activeRequest) {
      if (action.result) {
        if (
          activeRequest?.method === 'eth_requestAccounts' ||
          activeRequest?.method === 'eth_accounts'
        ) {
          ethereum.selectedAddress = action.result?.[0];
          console.log('eth_requestAccounts response', ethereum.selectedAddress);
        }

        if (activeRequest?.method === 'eth_chainId') {
          ethereum.chainId = action.result;
          console.log('eth_chainId response', ethereum.chainId);
        }

        activeRequest.resolve(action.result);
      } else if (action.error) {
        activeRequest.reject(action.error);
      }
    }
  };

  const logProvider = async () => {
    try {
      const result = await ethereum.request({method: 'eth_chainId'});
      console.log('chain', result);
    } catch (e) {
      console.log('e', e);
    }

    console.log(ethereum.chainId, ethereum.selectedAddress);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Button title="Listen Ethereum Events" onPress={listenEthereumEvents} />

        <Button title="Connect" onPress={connect} />

        <Button title="Add chain" onPress={exampleRequest} />

        <Button title="Log provider" onPress={logProvider} />
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.js</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
