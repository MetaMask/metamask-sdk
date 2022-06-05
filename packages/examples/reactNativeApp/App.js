/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
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
import BackgroundTimer from 'react-native-background-timer';

import MetaMaskSDK from '@metamask/sdk';

//import WC from '@walletconnect/client';

const sdk = new MetaMaskSDK({
  openDeeplink: link => {
    Linking.openURL(link);
  },
  timer: BackgroundTimer,
  dappMetadata: {
    name: 'React Native Test Dapp',
    url: 'example.com',
  },
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
  const [response, setResponse] = useState();

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const connect = async () => {
    try {
      const result = await ethereum.request({method: 'eth_requestAccounts'});
      console.log('RESULT', result);
      setResponse(result);
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const exampleRequest = async () => {
    try {
      const result = await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x64',
            rpcUrls: ['https://dai.poa.network'],
            chainName: 'xDAI Chain',
            nativeCurrency: {name: 'xDAI', decimals: 18, symbol: 'xDAI'},
            blockExplorerUrls: ['https://blockscout.com/poa/xdai'],
          },
        ],
      });
      console.log('RESULT', result);
      setResponse(result);
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const sign = async () => {
    const msgParams = JSON.stringify({
      domain: {
        // Defining the chain aka Rinkeby testnet or Ethereum Main Net
        chainId: parseInt(ethereum.chainId, 16),
        // Give a user friendly name to the specific contract you are signing for.
        name: 'Ether Mail',
        // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        // Just let's you know the latest version. Definitely make sure the field name is correct.
        version: '1',
      },

      // Defining the message signing data content.
      message: {
        /*
         - Anything you want. Just a JSON Blob that encodes the data you want to send
         - No required fields
         - This is DApp Specific
         - Be as explicit as possible when building out the message schema.
        */
        contents: 'Hello, Bob!',
        attachedMoneyInEth: 4.2,
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
      },
      // Refers to the keys of the *types* object below.
      primaryType: 'Mail',
      types: {
        // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
        EIP712Domain: [
          {name: 'name', type: 'string'},
          {name: 'version', type: 'string'},
          {name: 'chainId', type: 'uint256'},
          {name: 'verifyingContract', type: 'address'},
        ],
        // Not an EIP712Domain definition
        Group: [
          {name: 'name', type: 'string'},
          {name: 'members', type: 'Person[]'},
        ],
        // Refer to PrimaryType
        Mail: [
          {name: 'from', type: 'Person'},
          {name: 'to', type: 'Person[]'},
          {name: 'contents', type: 'string'},
        ],
        // Not an EIP712Domain definition
        Person: [
          {name: 'name', type: 'string'},
          {name: 'wallets', type: 'address[]'},
        ],
      },
    });

    var from = ethereum.selectedAddress;

    var params = [from, msgParams];
    var method = 'eth_signTypedData_v4';

    const resp = await ethereum.request({method, params});
    setResponse(resp);
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
        <Button title="Sign" onPress={sign} />

        <Button title="Log provider" onPress={logProvider} />
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">{response}</Section>
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
