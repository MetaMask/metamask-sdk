'use client';
import {
  EventType,
  MetaMaskSDK,
  MetaMaskSDKOptions,
  SDKProvider,
  ServiceStatus,
} from '@metamask/sdk';
import { EthereumRpcError } from 'eth-rpc-errors';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { handleAccountsChangedEvent } from './EventsHandlers/handleAccountsChangedEvent';
import { handleChainChangedEvent } from './EventsHandlers/handleChainChangedEvent';
import { handleConnectEvent } from './EventsHandlers/handleConnectEvent';
import { handleDisconnectEvent } from './EventsHandlers/handleDisconnectEvent';
import { handleInitializedEvent } from './EventsHandlers/handleInitializedEvent';
import { handleOnConnectingEvent } from './EventsHandlers/handleOnConnectingEvent';
import { handleProviderEvent } from './EventsHandlers/handleProviderEvent';
import { handleSDKStatusEvent } from './EventsHandlers/handleSDKStatusEvent';

const initProps: {
  sdk?: MetaMaskSDK;
  ready: boolean;
  connected: boolean;
  connecting: boolean;
  provider?: SDKProvider;
  error?: EthereumRpcError<unknown>;
  chainId?: string;
  account?: string;
  status?: ServiceStatus;
} = {
  ready: false,
  connected: false,
  connecting: false,
};
export const SDKContext = createContext(initProps);

const MetaMaskProviderClient = ({
  children,
  sdkOptions,
  debug,
}: {
  children: React.ReactNode;
  sdkOptions: MetaMaskSDKOptions;
  debug?: boolean;
}) => {
  const [sdk, setSDK] = useState<MetaMaskSDK>();

  const [ready, setReady] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [trigger, setTrigger] = useState<number>(1);
  const [chainId, setChainId] = useState<string>();
  const [account, setAccount] = useState<string>();
  const [error, setError] = useState<EthereumRpcError<unknown>>();
  const [provider, setProvider] = useState<SDKProvider>();
  const [status, setStatus] = useState<ServiceStatus>();
  const hasInit = useRef(false);

  useEffect(() => {
    // Prevent sdk double rendering with StrictMode
    if (hasInit.current) {
      if (debug) {
        console.debug(`[MetamaskProvider] sdk already initialized`);
      }
      return;
    }

    hasInit.current = true;

    const _sdk = new MetaMaskSDK({
      ...sdkOptions,
    });

    _sdk.init().then(() => {
      setSDK(_sdk);
      setReady(true);
    });
  }, [sdkOptions]);

  useEffect(() => {
    if (!ready || !sdk) {
      return;
    }

    if (debug) {
      console.debug(`[MetamaskProvider] init SDK Provider listeners`);
    }

    const activeProvider = sdk.getProvider();
    setConnected(activeProvider.isConnected());
    setAccount(activeProvider.selectedAddress || undefined);
    setProvider(activeProvider);

    const onConnecting = handleOnConnectingEvent(
      debug,
      setConnected,
      setConnecting,
      setError,
    );

    const onInitialized = handleInitializedEvent(
      debug,
      setConnecting,
      setAccount,
      activeProvider,
      setConnected,
      setError,
    );

    const onConnect = handleConnectEvent(
      debug,
      setConnecting,
      setConnected,
      setChainId,
      setError,
      chainId,
    );

    const onDisconnect = handleDisconnectEvent(
      debug,
      setConnecting,
      setConnected,
      setError,
    );

    const onAccountsChanged = handleAccountsChangedEvent(
      debug,
      setAccount,
      setConnected,
      setError,
    );

    const onChainChanged = handleChainChangedEvent(
      debug,
      setChainId,
      setConnected,
      setError,
    );

    const onSDKStatusEvent = handleSDKStatusEvent(debug, setStatus);

    activeProvider.on('_initialized', onInitialized);
    activeProvider.on('connecting', onConnecting);
    activeProvider.on('connect', onConnect);
    activeProvider.on('disconnect', onDisconnect);
    activeProvider.on('accountsChanged', onAccountsChanged);
    activeProvider.on('chainChanged', onChainChanged);
    sdk.on(EventType.SERVICE_STATUS, onSDKStatusEvent);

    return () => {
      activeProvider.removeListener('_initialized', onInitialized);
      activeProvider.removeListener('connecting', onConnecting);
      activeProvider.removeListener('connect', onConnect);
      activeProvider.removeListener('disconnect', onDisconnect);
      activeProvider.removeListener('accountsChanged', onAccountsChanged);
      activeProvider.removeListener('chainChanged', onChainChanged);
      sdk.removeListener(EventType.SERVICE_STATUS, onSDKStatusEvent);
    };
  }, [trigger, sdk, ready]);

  useEffect(() => {
    if (!ready || !sdk) {
      return;
    }

    const onProviderEvent = handleProviderEvent(
      debug,
      setConnecting,
      setTrigger,
    );
    sdk.on(EventType.PROVIDER_UPDATE, onProviderEvent);
    return () => {
      sdk.removeListener(EventType.PROVIDER_UPDATE, onProviderEvent);
    };
  }, [sdk, ready]);

  return (
    <SDKContext.Provider
      value={{
        sdk,
        ready,
        connected,
        provider,
        connecting,
        account,
        chainId,
        error,
        status,
      }}
    >
      {children}
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
        <>{children}</>
      )}
    </>
  );
};

export default MetaMaskProvider;
