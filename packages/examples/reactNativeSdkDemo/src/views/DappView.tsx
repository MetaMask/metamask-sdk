/* eslint-disable react-native/no-inline-styles */
import {useSDK} from '@metamask/sdk-react-native';
import React, {useState} from 'react';
import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors} from './colors';
import {NativeModules} from 'react-native';
const {MetaMaskReactNativeSdk} = NativeModules;

export interface DAPPViewProps {}

const createStyles = ({connected}: {connected: boolean}) => {
  return StyleSheet.create({
    container: {
      borderWidth: 2,
      borderColor: connected ? colors.success.default : colors.warning.default,
      padding: 10,
      backgroundColor: colors.background.default,
    },
    button: {
      height: 38,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'blue',
    },
    title: {
      backgroundColor: '#a5c9ff',
      textAlign: 'center',
      color: 'black',
      fontSize: 17,
      padding: 10,
    },
    textData: {
      color: 'black',
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    removeButton: {
      backgroundColor: 'red',
    },
  });
};

export const DAPPView = (_props: DAPPViewProps) => {
  const {sdk, provider, chainId, account, connected} = useSDK();

  const [response, setResponse] = useState<unknown>('');
  const styles = createStyles({connected});

  const connect = async () => {
    try {
      console.log('Calling Connect....');

      const res = (await sdk?.connect()) as string[];
      console.log('accounts', res);
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const connectWithChainSwitch = async () => {
    try {
      console.log('Calling ConnectWith....');

      const addChainRPC = {
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x89',
            chainName: 'Polygon',
            blockExplorerUrls: ['https://polygonscan.com'],
            nativeCurrency: {symbol: 'MATIC', decimals: 18},
            rpcUrls: ['https://polygon-rpc.com/'],
          },
        ],
      };

      const res = (await sdk?.connectWith(addChainRPC)) as string;
      console.log('connectWith result:', res);
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const connectAndSign = async () => {
    try {
      const signResult = await sdk?.connectAndSign({
        msg: 'Connect + Sign message',
      });
      console.log('connectAndSign result:', signResult);
      setResponse(signResult);
    } catch (err) {
      console.warn('failed to connect..', err);
    }
  };

  const getBalance = async () => {
    const from = await provider?.getSelectedAddress();

    try {
      const balanceResult = await provider?.request({
        method: 'eth_getBalance',
        params: [from, 'latest'],
      });
      console.log('getBalance result:', balanceResult);
      setResponse(balanceResult);
    } catch (err) {
      console.warn('failed to getBalance..', err);
    }
  };

  const addPolygonChainRequest = async () => {
    try {
      setResponse('');
      const result = await provider?.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x89',
            chainName: 'Polygon',
            blockExplorerUrls: ['https://polygonscan.com'],
            nativeCurrency: {symbol: 'MATIC', decimals: 18},
            rpcUrls: ['https://polygon-rpc.com/'],
          },
        ],
      });

      console.log('exampleRequest', result);

      setResponse(result);
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const changeNetwork = async (hexChainId: string) => {
    console.debug(`switching to network chainId=${hexChainId}`);
    setResponse(''); // reset response first

    try {
      const res = await provider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{chainId: hexChainId}], // chainId must be in hexadecimal numbers
      });

      console.debug('response', res);

      setResponse(res);
    } catch (e) {
      console.log(e);
    }
  };

  const sendTransaction = async () => {
    const to = '0x0000000000000000000000000000000000000000';
    const from = await provider?.getSelectedAddress();
    const transactionParameters = {
      to, // Required except during contract publications.
      from: from, // must match user's active address.
      value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
    };

    try {
      setResponse('');
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = await provider?.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      setResponse(txHash);
    } catch (e) {
      console.log(e);
    }
  };

  const sign = async () => {
    const currentChainId = await provider?.getChainId();

    const msgParams = JSON.stringify({
      domain: {
        // Defining the chain aka Rinkeby testnet or Ethereum Main Net
        chainId: currentChainId ? parseInt(currentChainId, 16) : 1,
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

    try {
      const from = await provider?.getSelectedAddress();

      const params = [from, msgParams];
      const method = 'eth_signTypedData_v4';

      setResponse('');
      const resp = await provider?.request({method, params});
      console.debug('sign response', resp);
      setResponse(resp);
    } catch (error) {
      console.error('an error occurred', error);
    }
  };

  const personalSign = async () => {
    const from = await provider?.getSelectedAddress();
    setResponse(''); // reset response first
    console.debug(`sign from: ${from}`);
    try {
      if (!from || from === null) {
        console.error(
          'Invalid account -- please connect using eth_requestAccounts first',
        );
        return;
      }

      const params = ['hello world', from];
      const method = 'personal_sign';
      console.debug(`ethRequest ${method}`, JSON.stringify(params, null, 4));
      console.debug('sign params', params);
      const resp = await provider?.request({method, params});
      setResponse(resp);
      console.debug('sign response', resp);
    } catch (e) {
      console.error('an error occurred', e);
    }
  };

  const batch = async () => {
    try {
      setResponse('');

      console.log('Calling batch request....');
      const address = await provider?.getSelectedAddress();
      const req1 = {
        method: 'personal_sign',
        params: ['Hello world', address],
      };
      const req2 = {
        method: 'personal_sign',
        params: ['Sending happiness', address],
      };
      const req3 = {
        method: 'personal_sign',
        params: ['Bye world', address],
      };
      const batchRequest = [req1, req2, req3];

      const res = (await provider?.batchRequest(batchRequest)) as unknown[];

      console.log('batch res ==>', res);

      setResponse(res);
      console.log('batchResponse', res);
    } catch (e) {
      console.error('error', e);
    }
  };

  const batchWithSwitchChain = async () => {
    try {
      setResponse('');

      console.log('Calling batch request....');
      const address = await provider?.getSelectedAddress();

      const req1 = {
        method: 'wallet_switchEthereumChain',
        params: [{chainId: '0x89'}], // chainId must be in hexadecimal numbers
      };

      const req2 = {
        method: 'personal_sign',
        params: ['Hello world', address],
      };

      const batchRequest = [req1, req2];

      const res = (await provider?.batchRequest(batchRequest)) as unknown[];

      console.log('batch res ==>', res);

      setResponse(res);
      console.log('batchResponse', res);
    } catch (e) {
      console.error('error', e);
    }
  };

  const textStyle = {
    color: colors.text.default,
    fontSize: 16,
  };

  return (
    <View style={{borderWidth: 2, padding: 8}}>
      <Text style={styles.title}>{'MetaMask_ReactNativeSDK - Demo Dapp'}</Text>

      <Text style={styles.title}>
        Connection State -{' '}
        {connected ? (
          <Text
            style={{
              color: 'green',
              fontWeight: 'bold',
              fontSize: 20,
            }}>
            Connected
          </Text>
        ) : (
          <Text
            style={{
              color: 'red',
              fontWeight: 'bold',
              fontSize: 20,
            }}>
            Disconnected
          </Text>
        )}{' '}
      </Text>

      {connected ? (
        <>
          <Button title={'Request Accounts'} onPress={connect} />
          <Button title="eth_signTypedData_v4" onPress={sign} />
          <Button title="Personal Sign" onPress={personalSign} />
          <Button title="Batch Sign Calls" onPress={batch} />
          <Button
            title="Get Balance"
            onPress={getBalance}
          />
          <Button
            title="Batch With Switch Chain"
            onPress={batchWithSwitchChain}
          />
          <Button title="Send Transaction" onPress={sendTransaction} />
          <Button
            title="Add The Polygon Chain"
            onPress={addPolygonChainRequest}
          />
          <View
            style={{
              marginVertical: 5,
            }}>
            <Button
              color={'#702963'}
              title="Switch To Polygon"
              onPress={() => {
                changeNetwork('0x89');
              }}
            />
            <Button
              color={'black'}
              title="Switch To Ethereum"
              onPress={() => {
                changeNetwork('0x1');
              }}
            />
          </View>
          <Text style={textStyle}>
            {chainId && `Connected Chain: ${chainId}\n`}
            {account && `Connected Account: ${account}\n\n`}
            {response ? `Last request response: ${response}` : ''}
          </Text>
        </>
      ) : (
        <View
          style={{
            marginVertical: 12,
          }}>
          <Button color={'green'} title={'Connect'} onPress={connect} />
          <Button
            color={'green'}
            title={'ConnectWithAddChain (to Polygon)'}
            onPress={connectWithChainSwitch}
          />
          <Button
            color={'green'}
            title={'ConnectAndSign'}
            onPress={connectAndSign}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, styles.removeButton]}
        onPress={() => {
          // Terminating will reset the connection state and clear the session
          // So it will require the user to connect again
          sdk?.terminate();
          setResponse('');
        }}>
        <Text style={styles.buttonText}>Terminate</Text>
      </TouchableOpacity>
    </View>
  );
};
