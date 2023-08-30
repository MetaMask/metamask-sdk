'use client'; // This is a client component 👈🏽

import { MetaMaskSDK, SDKProvider } from '@metamask/sdk';
import {
  ConnectionStatus,
  EventType,
  ServiceStatus,
} from '@metamask/sdk-communication-layer';
import Head from 'next/head';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    ethereum?: SDKProvider;
  }
}

export default function SDKContainer() {
  const [sdk, setSDK] = useState<MetaMaskSDK>();
  const [chain, setChain] = useState('');
  const [account, setAccount] = useState<string>();
  const [response, setResponse] = useState<any>('');
  const [connected, setConnected] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>();
  const [activeProvider, setActiveProvider] = useState<SDKProvider>();

  const connect = () => {
    if (!window.ethereum) {
      throw new Error(`invalid ethereum provider`);
    }

    window.ethereum
      .request({
        method: 'eth_requestAccounts',
        params: [],
      })
      .then((accounts) => {
        if (accounts) {
          console.debug(`connect:: accounts result`, accounts);
          setAccount((accounts as string[])[0]);
          setConnected(true);
        }
      })
      .catch((e) => console.log('request accounts ERR', e));
  };

  const sendTransactionOnly = async () => {
    if (!window.ethereum) {
      throw new Error(`invalid ethereum provider`);
    }

    const to = "0x0000000000000000000000000000000000000000";
    const transactionParameters = {
      to,
      from: window.ethereum.selectedAddress,
      value: "0x5AF3107A4000",
    };

    window.ethereum
      .request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })
      .catch((e) => console.log('sendTransactionOnly ERR', e));
  };

  const chainIdsendTransaction = async () => {
    if (!window.ethereum) {
      throw new Error(`invalid ethereum provider`);
    }

    const currentChainId = await window.ethereum?.request({ method: 'eth_chainId' });
    console.log("Current chain ID: ", currentChainId);

    const to = "0x0000000000000000000000000000000000000000";
    const transactionParameters = {
      to,
      from: window.ethereum.selectedAddress,
      value: "0x5AF3107A4000",
    };

    window.ethereum
      .request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })
      .catch((e) => console.log('sendTransactionOnly ERR', e));
  };

  useEffect(() => {
    const doAsync = async () => {
      const clientSDK = new MetaMaskSDK({
        useDeeplink: false,
        communicationServerUrl: process.env.NEXT_PUBLIC_COMM_SERVER_URL,
        checkInstallationImmediately: false,
        dappMetadata: {
          name: 'NEXTJS demo',
          url: window.location.host,
        },
        logging: {
          developerMode: false,
        },
        storage: {
          enabled: true,
        },
      });
      await clientSDK.init();
      setSDK(clientSDK);
    };
    doAsync();
  }, []);

  useEffect(() => {
    if(!sdk || !activeProvider) {
      return;
    }

    // activeProvider is mapped to window.ethereum.
    console.debug(`App::useEffect setup active provider listeners`);
    if (window.ethereum?.selectedAddress) {
      console.debug(`App::useEffect setting account from window.ethereum `);
      setAccount(window.ethereum?.selectedAddress);
      setConnected(true);
    } else {
      setConnected(false);
    }

    const onChainChanged = (chain: unknown) => {
      console.log(`App::useEfect on 'chainChanged'`, chain);
      setChain(chain as string);
      setConnected(true);
    };

    const onInitialized = () => {
      console.debug(`App::useEffect on _initialized`);
      setConnected(true);
      if (window.ethereum?.selectedAddress) {
        setAccount(window.ethereum?.selectedAddress);
      }

      if (window.ethereum?.chainId) {
        setChain(window.ethereum.chainId);
      }
    };

    const onAccountsChanged = (accounts: unknown) => {
      console.log(`App::useEfect on 'accountsChanged'`, accounts);
      setAccount((accounts as string[])?.[0]);
      setConnected(true);
    };

    const onConnect = (_connectInfo: unknown) => {
      console.log(`App::useEfect on 'connect'`, _connectInfo);
      setConnected(true);
    };

    const onDisconnect = (error: unknown) => {
      console.log(`App::useEfect on 'disconnect'`, error);
      setConnected(false);
      setChain('');
    };

    const onServiceStatus = (_serviceStatus: ServiceStatus) => {
      console.debug(`sdk connection_status`, _serviceStatus);
      setServiceStatus(_serviceStatus);
    };

    window.ethereum?.on('chainChanged', onChainChanged);

    window.ethereum?.on('_initialized', onInitialized);

    window.ethereum?.on('accountsChanged', onAccountsChanged);

    window.ethereum?.on('connect', onConnect);

    window.ethereum?.on('disconnect', onDisconnect);

    sdk.on(EventType.SERVICE_STATUS, onServiceStatus);

    return () => {
      console.debug(`App::useEffect cleanup activeprovider events`);
      window.ethereum?.removeListener('chainChanged', onChainChanged);
      window.ethereum?.removeListener('_initialized', onInitialized);
      window.ethereum?.removeListener('accountsChanged', onAccountsChanged);
      window.ethereum?.removeListener('connect', onConnect);
      window.ethereum?.removeListener('disconnect', onDisconnect);
      sdk.removeListener(EventType.SERVICE_STATUS, onServiceStatus);
    }
  }, [activeProvider])

  useEffect(() => {
    if (!sdk?.isInitialized()) {
      return;
    }

    const onProviderEvent = (accounts?: string[]) => {
      if (accounts?.[0]?.startsWith('0x')) {
        setConnected(true);
        setAccount(accounts?.[0]);
      } else {
        setConnected(false);
        setAccount(undefined);
      }
      setActiveProvider(sdk.getProvider());
    };
    // listen for provider change events
    sdk.on(EventType.PROVIDER_UPDATE, onProviderEvent);
    return () => {
      sdk.removeListener(EventType.PROVIDER_UPDATE, onProviderEvent);
    };
  }, [sdk]);

  const terminate = () => {
    sdk?.terminate();
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {serviceStatus?.connectionStatus === ConnectionStatus.WAITING && (
          <div>Waiting for Metamask to link the connection...</div>
        )}
        <p>ChannelId: {serviceStatus?.channelConfig?.channelId}</p>
        <p>{`Expiration: ${serviceStatus?.channelConfig?.validUntil ?? ''}`}</p>

        {connected ? (
          <div>
            <button style={{ padding: 10, margin: 10 }} onClick={connect}>
              Request Accounts
            </button>

            <button
              style={{ padding: 10, margin: 10 }}
              onClick={sendTransactionOnly}
            >
              sendTransaction ONLY
            </button>
            <button
              style={{ padding: 10, margin: 10 }}
              onClick={chainIdsendTransaction}
            >
              chainId + sendTransaction
            </button>
          </div>
        ) : (
          <button style={{ padding: 10, margin: 10 }} onClick={connect}>
            Connect
          </button>
        )}

        <button
          style={{ padding: 10, margin: 10, backgroundColor: 'red' }}
          onClick={terminate}
        >
          Terminate
        </button>

        <div>
          <>
            {chain && `Connected chain: ${chain}`}
            <p></p>
            {account && `Connected account: ${account}`}
            <p
              style={{
                width: '300px',
                overflow: 'auto',
                border: '1px solid red',
              }}
            >
              {response && `Last request response: ${response}`}
            </p>
          </>
        </div>
      </main>
    </>
  );
}
