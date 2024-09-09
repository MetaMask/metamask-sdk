import { useSDK } from '@metamask/sdk-react-native';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Text,
  View,
} from 'react-native';
import { ethers } from 'ethers';


export function DemoSignView(): React.JSX.Element {
  const { provider: MMProvider, account, connected } = useSDK();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();


  useEffect(() => {
    if (connected && MMProvider && !provider) {
      // The following line will crash the app
      // if the option `infuraAPIKey` is provided to the MetaMaskProvider
      // We have this error on the ios sdk side: metamask-ios-sdk/Network.swift:46
      // *** Terminating app due to uncaught exception 'NSInvalidArgumentException', reason: 'Invalid type in JSON write (_NSInlineData)'
      const provider = new ethers.providers.Web3Provider(
        MMProvider
      );

      setProvider(provider);
    }
  }, [connected, MMProvider, setProvider]);

  return (
    <>
      <Text>
        Sign Demo
      </Text>
      {
        (!provider || !account)
          ? <Text> User is not connected</Text>
          : <DemoSignComponent account={account} provider={provider} />
      }
    </>
  );
}


function DemoSignComponent({ account, provider }: { account: string; provider: ethers.providers.Web3Provider }): React.JSX.Element {
  const [signature, setSignature] = useState<string>();

  async function sign() {
    const signer = provider.getSigner(account);

    const signature = await signer.signMessage('Hello');
    setSignature(signature);
  }

  return (
    <View>
      <Text>
        Sign message with address: {account}
      </Text>
      <Button title="Sign" onPress={sign} />
      <Text>
        Signature: {signature}
      </Text>
    </View>
  );
}