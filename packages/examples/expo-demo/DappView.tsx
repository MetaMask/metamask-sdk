import {
  ConnectionStatus,
  EventType,
  MetaMaskSDK,
  SDKProvider,
} from '@metamask/sdk';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const colors = {
  background: {
    default: 'white',
    alternative: 'grey',
  },
  text: {
    default: 'black',
    alternative: '',
    mutext: '',
  },
  primary: {
    background: '',
  },
  success: {
    default: '#99cc33',
    inverse: 'white',
  },
  warning: {
    default: '#ffcc00',
    inverse: 'white',
  },
};

export interface DAPPViewProps {
  sdk: MetaMaskSDK;
}

const createStyles = (connectionStatus: ConnectionStatus) => {
  return StyleSheet.create({
    container: {
      borderWidth: 2,
      borderColor:
        connectionStatus === ConnectionStatus.LINKED
          ? colors.success.default
          : colors.warning.default,
      padding: 10,
      backgroundColor: colors.background.default,
    },
    button: {
      height: 30,
      marginTop: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'blue',
    },
    title: {
      backgroundColor: '#a5c9ff',
      textAlign: 'center',
      padding: 10,
    },
    textData: {
      color: 'black',
    },
    buttonText: {
      color: 'black',
    },
    removeButton: {
      backgroundColor: '#ffcc00',
    },
  });
};

export const DAPPView = ({ sdk }: DAPPViewProps) => {
  const [response, setResponse] = useState<unknown>('');
  const [account, setAccount] = useState<string>();
  const [chain, setChain] = useState<string>();
  const [balance, setBalance] = useState<string>();
  const [connected, setConnected] = useState<boolean>(false);
  const [status, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);
  const styles = createStyles(status);

  useEffect(() => {
    if (!sdk.getProvider()) {
      console.warn('invalid provider state');
      return;
    }

    try {
      console.debug(
        `useffect ethereum.selectedAddress=${
          sdk.getProvider()?.selectedAddress
        }`,
      );
      if (sdk.getProvider()?.selectedAddress) {
        setConnected(true);
        setAccount(sdk.getProvider()?.selectedAddress as string);
      }

      sdk.getProvider()?.on('connect', () => {
        setConnected(true);
      });

      sdk.getProvider()?.on('chainChanged', (newChain: unknown) => {
        console.log('useEffect::ethereum on "chainChanged"', newChain);
        setChain(newChain as string);
      });

      sdk.getProvider()?.on('_initialized', () => {
        console.log(
          `useEffect::ethereum on "_initialized" ethereum.selectedAddress=${
            sdk.getProvider()?.selectedAddress
          } ethereum.chainId=${sdk.getProvider()?.chainId}`,
        );
        if (sdk.getProvider()?.selectedAddress) {
          setAccount(sdk.getProvider()?.selectedAddress as string);
        }
        if (sdk.getProvider()?.chainId) {
          setChain(sdk.getProvider()?.chainId as string);
        }
      });

      sdk.getProvider()?.on('accountsChanged', (_accounts: unknown) => {
        const accounts = _accounts as string[];
        console.log('useEffect::ethereum on "accountsChanged"', accounts);
        if (accounts.length > 0 && accounts[0] !== account) {
          setAccount(accounts?.[0]);
        }
      });

      sdk.getProvider()?.on('disconnect', () => {
        console.log('useEffect::ethereum on "disconnect"');
        setConnected(false);
      });

      sdk.on(
        EventType.CONNECTION_STATUS,
        (_connectionStatus: ConnectionStatus) => {
          setConnectionStatus(_connectionStatus);
        },
      );
    } catch (err) {
      console.log('errror', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = async () => {
    try {
      const result = (await sdk.getProvider()?.request({
        method: 'eth_requestAccounts',
      })) as string[];
      console.log('RESULT', result?.[0]);
      setConnected(true);
      setAccount(result?.[0]);
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const exampleRequest = async () => {
    try {
      const result = await sdk.getProvider()?.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x89',
            chainName: 'Polygon',
            blockExplorerUrls: ['https://polygonscan.com'],
            nativeCurrency: { symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/'],
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
        chainId: sdk.getProvider()?.chainId
          ? parseInt(sdk.getProvider()?.chainId || '', 16)
          : 1,
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
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        // Not an EIP712Domain definition
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
        // Refer to PrimaryType
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        // Not an EIP712Domain definition
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
      },
    });

    var from = sdk.getProvider()?.selectedAddress;

    var params = [from, msgParams];
    var method = 'eth_signTypedData_v4';

    const resp = await sdk.getProvider()?.request({ method, params });
    setResponse(resp);
  };

  const sendTransaction = async () => {
    const to = '0x0000000000000000000000000000000000000000';
    const transactionParameters = {
      to, // Required except during contract publications.
      from: sdk.getProvider()?.selectedAddress, // must match user's active address.
      value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
    };

    try {
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = await sdk.getProvider()?.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      setResponse(txHash);
    } catch (e) {
      console.log(e);
    }
  };

  const textStyle = {
    color: colors.text.default,
    margin: 10,
    fontSize: 16,
  };

  return (
    <View style={{ borderWidth: 2, padding: 5 }}>
      <Text style={styles.title}>
        {sdk._getDappMetadata()?.name} (
        {connected ? 'connected' : 'disconnected'})
      </Text>

      {connected ? (
        <>
          <Button title={'Request Accounts'} onPress={connect} />
          <Button title="Sign" onPress={sign} />
          <Button title="Send transaction" onPress={sendTransaction} />
          <Button title="Add chain" onPress={exampleRequest} />
          <Text style={textStyle}>
            {chain && `Connected chain: ${chain}\n`}
            {account && `Connected account: ${account}\n\n`}
            {account && balance && `Balance: ${balance} ETH`}
          </Text>
          <Text style={textStyle}>
            {response ? `Last request response: ${response}` : ''}
          </Text>
        </>
      ) : (
        <Button title={'Connect'} onPress={connect} />
      )}

      <TouchableOpacity
        style={[styles.button, styles.removeButton]}
        onPress={() => {
          sdk.terminate();
          setConnected(false);
          setAccount(undefined);
          setBalance(undefined);
          setChain(undefined);
          setResponse('');
        }}
      >
        <Text style={styles.buttonText}>Terminate</Text>
      </TouchableOpacity>
    </View>
  );
};
