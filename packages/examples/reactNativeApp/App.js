/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useRef} from 'react';
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
import {WebView} from 'react-native-webview';

import sdk from './sdk.html';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

//import EventEmitter from 'es-event-emitter';
import EventEmitter2Pkg from 'eventemitter2';
const {EventEmitter2: EventEmitter} = EventEmitter2Pkg;

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

class Ethereum extends EventEmitter {
  activeRequests = {};

  isMetaMask = true;

  webViewRef = null;

  events = {};

  chainId = undefined;
  selectedAddress = undefined;

  initListeners() {
    const accountsChangedRun = `(function(){ 
      ethereum.on('accountsChanged', (result) => window.ReactNativeWebView.postMessage(JSON.stringify({method: 'accountsChanged', result})));
    })()`;

    this.webViewRef.current.injectJavaScript(accountsChangedRun);

    const chainChanged = `(function(){ 
      ethereum.on('chainChanged', (result) => window.ReactNativeWebView.postMessage(JSON.stringify({method: 'chainChanged', result})));
    })()`;

    this.webViewRef.current.injectJavaScript(chainChanged);

    this.request({method: 'eth_accounts'});
    this.request({method: 'eth_chainId'});
  }

  async request(args) {
    const id = new Date().getTime();

    const run = `(function(){ 
      ethereum.request(${JSON.stringify(args)}).then((result)=>{
        window.ReactNativeWebView.postMessage(JSON.stringify({id: ${id}, result}))
      }).catch((error)=>{
        window.ReactNativeWebView.postMessage(JSON.stringify({id: ${id}, error}))
      })
    })()`;
    this.webViewRef.current.injectJavaScript(run);
    return new Promise((resolve, reject) => {
      this.activeRequests[id] = {resolve, reject, method: args.method};
    });
  }

  isConnected() {
    return true;
  }

  _metamask = {isUnlocked: () => true};
}

const ethereum = new Ethereum();
const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const webViewRef = useRef();
  useEffect(() => {
    ethereum.webViewRef = webViewRef;
    ethereum.initListeners();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
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
        <WebView
          ref={webViewRef}
          style={{height: 0}}
          originWhitelist={['*']}
          source={sdk}
          onMessage={onMessage}
        />
        <Button title="Listen Ethereum Events" onPress={listenEthereumEvents} />

        <Button title="Connect" onPress={exampleRequest} />

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
