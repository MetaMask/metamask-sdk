import { ConnectionStatus, EventType, MetaMaskSDK } from '@metamask/sdk';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from './colors';
import { ServiceStatusView } from './service-status-view';

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
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [ethereum] = useState(sdk.getProvider());
  const [response, setResponse] = useState<unknown>('');
  const [account, setAccount] = useState<string>();
  const [chain, setChain] = useState<string>();
  const [readOnlyCalls, setReadOnlyCalls] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>();
  const [connected, setConnected] = useState<boolean>(false);
  const [status, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);
  const [serviceStatus, _setServiceStatus] = useState(sdk._getServiceStatus());
  const styles = createStyles(status);

  const getBalance = async () => {
    if (!ethereum?.selectedAddress) {
      return;
    }
    const bal =
      (await provider?.getBalance(ethereum?.selectedAddress)) ??
      ethers.BigNumber.from(0);
    setBalance(ethers.utils.formatEther(bal));
  };

  useEffect(() => {
    if (!ethereum) {
      console.warn('invalid provider state');
      return;
    }

    try {
      setProvider(
        new ethers.providers.Web3Provider(
          ethereum as unknown as ethers.providers.ExternalProvider,
        ),
      );

      console.debug(
        `useffect ethereum.selectedAddress=${ethereum.selectedAddress}`,
      );
      if (ethereum.selectedAddress) {
        setConnected(true);
        setAccount(ethereum.selectedAddress);
      }

      ethereum.on('connect', () => {
        setConnected(true);
      });

      ethereum.on('chainChanged', (arg: unknown) => {
        const newChain = String(arg) as string; // Type assertion to string
        console.log('useEffect::ethereum on "chainChanged"', newChain);
        setChain(newChain);
      });

      ethereum.on('_initialized', () => {
        console.log(
          `useEffect::ethereum on "_initialized" ethereum.selectedAddress=${ethereum.selectedAddress} ethereum.chainId=${ethereum.chainId}`,
        );
        if (ethereum.selectedAddress) {
          setAccount(ethereum?.selectedAddress);
          getBalance();
        }
        if (ethereum.chainId) {
          setChain(ethereum.chainId);
        }
        setReadOnlyCalls(sdk.hasReadOnlyRPCCalls())
      });

      ethereum.on('accountsChanged', (...args: unknown[]) => {
        const accounts = args[0] as string[]; // Assuming the first argument is an array of strings
        console.log('useEffect::ethereum on "accountsChanged"', accounts);
        if (accounts?.length > 0 && accounts[0] !== account) {
          setAccount(accounts[0]);
          getBalance();
        }
      });

      ethereum.on('disconnect', () => {
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
  }, [ethereum]);

  const connect = async () => {
    try {
      const result = (await ethereum?.request({
        method: 'eth_requestAccounts',
      })) as string[];
      console.log('RESULT', result?.[0]);
      setConnected(true);
      setAccount(result?.[0]);
      setReadOnlyCalls(sdk.hasReadOnlyRPCCalls())
      getBalance();
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const exampleRequest = async () => {
    try {
      const result = await ethereum?.request({
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
      console.log('exampleRequest', result);
      setResponse(result);
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const testEthers = async () => {
    const web3Provider = new ethers.providers.Web3Provider(sdk?.getProvider()! as any)
    const signer = web3Provider.getSigner();
    console.debug(`signer`, signer);

    // const addr = await signer.getAddress();
    // console.log('addr', addr);

    const msg = await signer.signMessage('hello world')
    console.debug(`msg`, msg);
  }

  const sign = async () => {
    const msgParams = JSON.stringify({
      domain: {
        // Defining the chain aka Rinkeby testnet or Ethereum Main Net
        chainId: ethereum?.chainId ? parseInt(ethereum.chainId, 16) : 1,
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

    var from = ethereum?.selectedAddress;

    var params = [from, msgParams];
    var method = 'eth_signTypedData_v4';

    const resp = await ethereum?.request({ method, params });
    console.debug('sign response', resp);
    setResponse(resp);
  };

  const sendTransaction = async () => {
    const to = '0x0000000000000000000000000000000000000000';
    const transactionParameters = {
      to, // Required except during contract publications.
      from: ethereum?.selectedAddress, // must match user's active address.
      value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
    };

    try {
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = await ethereum?.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      setResponse(txHash);
    } catch (e) {
      console.log(e);
    }
  };

  const testReadOnlyCalls = async () => {
    try {
      const chain = await ethereum?.request({ method: 'eth_chainId', params: [] })
      console.log(`testReadOnlyCalls: chain`, chain);

      const acc1 = `0x8e0E30e296961f476E01184274Ce85ae60184CB0`
      const b1 = await ethereum?.request({ method: 'eth_getBalance', params: [acc1, "latest"] })
      const acc2 = `0xA9FBbc6C2E49643F8B58Efc63ED0c1f4937A171E`;
      const b2 = await ethereum?.request({ method: 'eth_getBalance', params: [acc2, "latest"] })
      console.log(`balance: ${acc1}`, b1);
      console.log(`balance: ${acc2}`, b2);
    } catch (e) {
      console.log(e);
    }
  }

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
      <ServiceStatusView serviceStatus={serviceStatus} />

      {readOnlyCalls && (
        <Button title="Test read-only calls" onPress={testReadOnlyCalls} />
      )}

      {connected ? (
        <>
          <Button title={'Request Accounts'} onPress={connect} />
          <Button title="Sign" onPress={sign} />
          <Button title="testEthers" onPress={testEthers} />
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
        }}>
        <Text style={styles.buttonText}>Terminate</Text>
      </TouchableOpacity>
    </View>
  );
};
