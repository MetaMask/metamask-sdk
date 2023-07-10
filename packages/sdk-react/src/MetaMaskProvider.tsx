'use client';
import {
  EventType,
  MetaMaskSDK,
  MetaMaskSDKOptions,
  ServiceStatus
} from '@metamask/sdk';
import { publicProvider } from '@wagmi/core/providers/public';
import { EthereumRpcError } from 'eth-rpc-errors';
import React, {
  createContext,
  useCallback,
  useEffect, useState
} from 'react';
import {
  Chain,
  configureChains,
  Connector,
  createConfig,
  mainnet,
  WagmiConfig
} from 'wagmi';
import MetaMaskConnector from './MetaMaskConnector';

const initProps: {
  sdk?: MetaMaskSDK;
  connected: boolean;
  connecting: boolean;
  error?: EthereumRpcError<unknown>;
  chainId?: string;
  account?: string;
  status?: ServiceStatus;
} = {
  connected: false,
  connecting: false,
};
export const SDKContext = createContext(initProps);

const { publicClient } = configureChains([mainnet], [publicProvider()]);

const serverConfig = createConfig({
  autoConnect: true,
  publicClient,
});

const WagmiWrapper = ({
  children,
  networks,
  sdk,
  debug,
  connectors = [],
}: {
  children: React.ReactNode;
  networks?: Chain[];
  sdk?: MetaMaskSDK;
  debug?: boolean;
  connectors?: Connector[];
}) => {
  if (!sdk) {
    return <></>;
  }

  // If no sdk is provided, we will use the public client
  const validConnectors: Connector[] = [
    new MetaMaskConnector({
      chains: networks,
      options: { sdk, debug },
    }),
    ...connectors,
  ];
  const [config] = useState(
    createConfig({ publicClient, connectors: validConnectors }),
  );

  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  );
};

const MetaMaskProviderClient = ({
  children,
  sdkOptions,
  debug,
}: {
  children: React.ReactNode;
  sdkOptions: MetaMaskSDKOptions;
  debug?: boolean;
}) => {
  const [trigger, setTrigger] = useState<number>(0);

  const [sdk, setSDK] = useState<MetaMaskSDK>();

  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<string>();
  const [account, setAccount] = useState<string>();
  const [error, setError] = useState<EthereumRpcError<unknown>>();
  const [status, setStatus] = useState<ServiceStatus>();

  const onSDKStatusEvent = useCallback((_serviceStatus: ServiceStatus) => {
    if (debug) {
      console.debug(
        `MetaMaskProvider::sdk on '${EventType.SERVICE_STATUS}/${_serviceStatus.connectionStatus}' event.`,
        _serviceStatus,
      );
    }
    setStatus(_serviceStatus);
  }, []);

  useEffect(() => {
    // Prevent sdk re-rendering
    if (sdk) {
      if (debug) {
        console.debug(`[MetamaskProvider] sdk already initialized`);
      }
      return;
    }
    const _sdk = new MetaMaskSDK({
      ...sdkOptions,
    });
    setSDK(_sdk);
  }, [sdkOptions]);

  useEffect(() => {
    if (!sdk) {
      return;
    }

    if (debug) {
      console.debug(`[MetamaskProvider] init SDK Provider trigger=${trigger}`);
    }
    const provider = sdk.getProvider();

    const onConnecting = () => {
      if (debug) {
        console.debug(`MetaMaskProvider::provider on 'connecting' event.`);
      }
      setConnected(false);
      setConnecting(true);
      setError(undefined);
    };

    const onInitialized = () => {
      if (debug) {
        console.debug(`MetaMaskProvider::provider on '_initialized' event.`);
      }
      setConnecting(false);
      setAccount(provider?.selectedAddress || undefined);
      setConnected(true);
      setError(undefined);
    };

    const onConnect = (connectParam: unknown) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::provider on 'connect' event.`,
          connectParam,
        );
      }
      setConnecting(false);
      setConnected(true);
      setChainId((connectParam as { chainId: string })?.chainId);
      setError(undefined);
      if (chainId) {
        setChainId(chainId);
      }
    };

    const onDisconnect = (reason: unknown) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::provider on 'disconnect' event.`,
          reason,
        );
      }
      setConnecting(false);
      setConnected(false);
      setError(reason as EthereumRpcError<unknown>);
    };

    const onAccountsChanged = (newAccounts: any) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::provider on 'accountsChanged' event.`,
          newAccounts,
        );
      }
      setAccount((newAccounts as string[])?.[0]);
      setConnected(true);
      setError(undefined);
    };

    const onChainChanged = (networkVersion: any) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::provider on 'chainChanged' event.`,
          networkVersion,
        );
      }
      setChainId(
        (
          networkVersion as {
            chainId?: string;
            networkVersion?: string;
          }
        )?.chainId,
      );
      setConnected(true);
      setError(undefined);
    };

    provider?.on('_initialized', onInitialized);
    provider?.on('connecting', onConnecting);
    provider?.on('connect', onConnect);
    provider?.on('disconnect', onDisconnect);
    provider?.on('accountsChanged', onAccountsChanged);
    provider?.on('chainChanged', onChainChanged);
    sdk.on(EventType.SERVICE_STATUS, onSDKStatusEvent);

    return () => {
      provider?.removeListener('_initialized', onInitialized);
      provider?.removeListener('connecting', onConnecting);
      provider?.removeListener('connect', onConnect);
      provider?.removeListener('disconnect', onDisconnect);
      provider?.removeListener('accountsChanged', onAccountsChanged);
      provider?.removeListener('chainChanged', onChainChanged);
      sdk.removeListener(EventType.SERVICE_STATUS, onSDKStatusEvent);
    };
  }, [trigger, sdk, debug]);

  useEffect(() => {
    if (!sdk) {
      return;
    }

    const onProviderEvent = (accounts?: string[]) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::sdk on '${EventType.PROVIDER_UPDATE}' event.`,
          accounts,
        );
      }

      if (accounts?.[0]?.startsWith('0x')) {
        setConnected(true);
        setAccount(accounts?.[0]);
        setConnecting(false);
      } else {
        setConnected(false);
        setAccount(undefined);
        setConnecting(false);
      }
      setTrigger((_trigger) => _trigger + 1);
    };
    sdk.on(EventType.PROVIDER_UPDATE, onProviderEvent);
    return () => {
      sdk.removeListener(EventType.PROVIDER_UPDATE, onProviderEvent);
    };
  }, [sdk]);

  return (
    <SDKContext.Provider
      value={{ sdk, connected, connecting, account, chainId, error, status }}
    >
      <WagmiWrapper sdk={sdk} debug={debug}>{children}</WagmiWrapper>
    </SDKContext.Provider>
  );
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
  }, []);

  return (
    <>
      {clientSide ? (
        <MetaMaskProviderClient debug={debug} sdkOptions={sdkOptions}>
          {children}
        </MetaMaskProviderClient>
      ) : (
        <WagmiConfig config={serverConfig}>{children}</WagmiConfig>
      )}
    </>
  );
};

export default MetaMaskProvider;
