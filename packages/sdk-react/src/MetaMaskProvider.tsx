'use client'
import { EventType, MetaMaskSDK, MetaMaskSDKOptions, ServiceStatus } from '@metamask/sdk';
import { publicProvider } from '@wagmi/core/providers/public';
import { EthereumRpcError } from 'eth-rpc-errors';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Chain, configureChains, Connector, createConfig, mainnet, WagmiConfig } from 'wagmi';
import MetaMaskConnector from './MetaMaskConnector';

const initProps: {
  sdk?: MetaMaskSDK,
  connected: boolean,
  connecting: boolean,
  error?: EthereumRpcError<unknown>;
  chainId?: string,
  account?: string,
  status?: ServiceStatus,
} = {
  connected: false,
  connecting: false,
}
export const SDKContext = createContext(initProps);

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()],
)

const serverConfig = createConfig({
  autoConnect: true,
  publicClient,
})

const WagmiWrapper = ({
  children,
  networks,
  sdk,
  connectors = [],
}: {
  children: React.ReactNode;
  networks?: Chain[];
  sdk?: MetaMaskSDK;
  connectors?: Connector[];
}) => {
  let validConnectors = [...connectors];
  if (sdk) {
    const MMConnector = new MetaMaskConnector({ chains: networks, sdk })
    validConnectors = [MMConnector, ...connectors];
  }

  const config = createConfig({
    autoConnect: true,
    connectors: validConnectors,
    publicClient,
  })

  return <WagmiConfig config={config}>{children}</WagmiConfig>;
};

// Wrap around to make sure the actual provider is only called on client to prevent nextjs issues.
export const MetaMaskProvider = ({
  children,
  sdkOptions,
  debug,
}: {
  children: React.ReactNode;
  sdkOptions: MetaMaskSDKOptions;
  debug?: boolean;
}) => {
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    setClientSide(true);
  }, [])

  return (
    <>
      {
        clientSide ?
          <MetaMaskProviderClient debug={debug} sdkOptions={sdkOptions}>{children}</MetaMaskProviderClient> :
          (
            <WagmiConfig config={serverConfig}>{children}</WagmiConfig>
          )
      }
    </>)
}

const MetaMaskProviderClient = ({
  children,
  sdkOptions,
  debug,
}: {
  children: React.ReactNode;
  sdkOptions: MetaMaskSDKOptions;
  debug?: boolean,
}) => {
  const sdk = useMemo(() => new MetaMaskSDK({
    ...sdkOptions,
  }), []);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<string>();
  const [account, setAccount] = useState<string>();
  const [error, setError] = useState<EthereumRpcError<unknown>>();
  const [status, setStatus] = useState<ServiceStatus>();

  useEffect(() => {
    const provider = sdk.getProvider();
    provider?.on('connecting', () => {
      if (debug) {
        console.debug(`MetaMaskProvider::provider on 'connecting' event.`);
      }
      setConnected(false);
      setConnecting(true);
      setError(undefined);
    })
    provider?.on('_initialized', () => {
      if (debug) {
        console.debug(`MetaMaskProvider::provider on '_initialized' event.`);
      }
      setConnecting(false);
      setConnected(true);
      setError(undefined);
    })
    provider?.on('connect', (connectParam: { chainId: string }) => {
      if (debug) {
        console.debug(`MetaMaskProvider::provider on 'connect' event.`, connectParam);
      }
      setConnecting(false);
      setConnected(true);
      setError(undefined);
      if (chainId) {
        setChainId(chainId);
      }
    })
    provider?.on('disconnect', (error: EthereumRpcError<unknown>) => {
      if (debug) {
        console.debug(`MetaMaskProvider::provider on 'disconnect' event.`, error);
      }
      setConnecting(false);
      setConnected(false);
      setError(error);
    })
    provider?.on('accountsChanged', (newAccounts: string[]) => {
      if (debug) {
        console.debug(`MetaMaskProvider::provider on 'accountsChanged' event.`, newAccounts);
      }
      setAccount(newAccounts?.[0]);
      setConnected(true);
      setError(undefined);
    })
    provider?.on('chainChanged', (networkVersion: {
      chainId?: string,
      networkVersion?: string,
    }) => {
      if (debug) {
        console.debug(`MetaMaskProvider::provider on 'chainChanged' event.`, networkVersion);
      }
      setChainId(networkVersion?.chainId);
      setConnected(true);
      setError(undefined);
    })
    sdk.on(EventType.SERVICE_STATUS, onSDKStatusEvent)

    return () => {
      provider?.removeAllListeners();
    }
  }, [])

  const onSDKStatusEvent = useCallback((_serviceStatus: ServiceStatus) => {
    if (debug) {
      console.debug(`MetaMaskProvider::sdk on '${EventType.SERVICE_STATUS}' event.`, _serviceStatus);
    }
    setStatus(_serviceStatus)
  }, []);

  const WagmiMemo = React.memo(() => {
    return (<WagmiWrapper sdk={sdk}>{children}</WagmiWrapper>);
  })

  return <SDKContext.Provider value={{ sdk, connected, connecting, account, chainId, error, status }}><WagmiMemo /></SDKContext.Provider >;
};

export default MetaMaskProvider;
