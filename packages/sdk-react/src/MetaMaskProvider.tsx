'use client';
import {
  EventType,
  MetaMaskSDK,
  MetaMaskSDKOptions,
  SDKProvider,
  ServiceStatus,
} from '@metamask/sdk';
import { RPCMethodCache } from '@metamask/sdk-communication-layer';
import { EthereumRpcError } from 'eth-rpc-errors';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { useHandleAccountsChangedEvent } from './EventsHandlers/useHandleAccountsChangedEvent';
import { useHandleChainChangedEvent } from './EventsHandlers/useHandleChainChangedEvent';
import { useHandleConnectEvent } from './EventsHandlers/useHandleConnectEvent';
import { useHandleDisconnectEvent } from './EventsHandlers/useHandleDisconnectEvent';
import { useHandleInitializedEvent } from './EventsHandlers/useHandleInitializedEvent';
import { useHandleOnConnectingEvent } from './EventsHandlers/useHandleOnConnectingEvent';
import { useHandleProviderEvent } from './EventsHandlers/useHandleProviderEvent';
import { useHandleSDKStatusEvent } from './EventsHandlers/useHandleSDKStatusEvent';

export interface EventHandlerProps {
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setChainId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >;
  setAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  setStatus: React.Dispatch<React.SetStateAction<ServiceStatus | undefined>>;
  setTrigger: React.Dispatch<React.SetStateAction<number>>;
  setRPCHistory: React.Dispatch<React.SetStateAction<RPCMethodCache>>;
  debug?: boolean;
  chainId?: string;
  activeProvider?: SDKProvider;
  sdk?: MetaMaskSDK;
}

export interface SDKState {
  sdk?: MetaMaskSDK;
  ready: boolean;
  connected: boolean;
  connecting: boolean;
  extensionActive: boolean;
  // Allow querying blockchain while wallet isn't connected
  readOnlyCalls: boolean;
  provider?: SDKProvider;
  error?: EthereumRpcError<unknown>;
  chainId?: string;
  balance?: string; // hex value in wei
  account?: string;
  status?: ServiceStatus;
  rpcHistory?: RPCMethodCache;
}

const initProps: SDKState = {
  ready: false,
  extensionActive: false,
  connected: false,
  connecting: false,
  readOnlyCalls: false,
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
  const [readOnlyCalls, setReadOnlyCalls] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [trigger, setTrigger] = useState<number>(1);
  const [chainId, setChainId] = useState<string>();
  const [balance, setBalance] = useState<string>();
  const [account, setAccount] = useState<string>();
  const [error, setError] = useState<EthereumRpcError<unknown>>();
  const [provider, setProvider] = useState<SDKProvider>();
  const [status, setStatus] = useState<ServiceStatus>();
  const [rpcHistory, setRPCHistory] = useState<RPCMethodCache>({});
  const [extensionActive, setExtensionActive] = useState<boolean>(false);
  const hasInit = useRef(false);

  const eventHandlerProps: EventHandlerProps = {
    setConnecting,
    setConnected,
    setChainId,
    setError,
    setAccount,
    setStatus,
    setTrigger,
    setRPCHistory,
    debug,
    chainId,
    activeProvider: sdk?.getProvider(),
    sdk,
  };

  const onConnecting = useHandleOnConnectingEvent(eventHandlerProps);

  const onInitialized = useHandleInitializedEvent(eventHandlerProps);

  const onConnect = useHandleConnectEvent(eventHandlerProps);

  const onDisconnect = useHandleDisconnectEvent(eventHandlerProps);

  const onAccountsChanged = useHandleAccountsChangedEvent(eventHandlerProps);

  const onChainChanged = useHandleChainChangedEvent(eventHandlerProps);

  const onSDKStatusEvent = useHandleSDKStatusEvent(eventHandlerProps);

  const onProviderEvent = useHandleProviderEvent(eventHandlerProps);

  useEffect(() => {
    if (account) {
      // Retrieve balance of account
      sdk
        ?.getProvider()
        .request({
          method: 'eth_getBalance',
          params: [account, 'latest'],
        })
        .then((accountBalance: unknown) => {
          if (debug) {
            console.debug(
              `[MetamaskProvider] balance of ${account} is ${accountBalance}`,
            );
          }

          setBalance(accountBalance as string);
        })
        .catch((err: any) => {
          console.warn(
            `[MetamaskProvider] error retrieving balance of ${account}`,
            err,
          );
        });
    } else {
      setBalance(undefined);
    }
  }, [account, chainId]);

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
      setReadOnlyCalls(_sdk.hasReadOnlyRPCCalls());
    });
  }, [sdkOptions]);

  useEffect(() => {
    if (!ready || !sdk) {
      return;
    }

    if (debug) {
      console.debug(`[MetamaskProvider] init SDK Provider listeners`);
    }

    setExtensionActive(sdk.isExtensionActive());

    const activeProvider = sdk.getProvider();
    setConnected(activeProvider.isConnected());
    setAccount(activeProvider.selectedAddress || undefined);
    setProvider(activeProvider);
    setChainId(activeProvider.chainId || undefined);

    activeProvider.on('_initialized', onInitialized);
    activeProvider.on('connecting', onConnecting);
    activeProvider.on('connect', onConnect);
    activeProvider.on('disconnect', onDisconnect);
    activeProvider.on('accountsChanged', onAccountsChanged);
    activeProvider.on('chainChanged', onChainChanged);
    sdk.on(EventType.SERVICE_STATUS, onSDKStatusEvent);

    sdk._getConnection()?.getConnector().on(EventType.RPC_UPDATE, () => {
      // hack to force a react re-render when the RPC cache is updated
      const temp = JSON.parse(JSON.stringify(sdk.getRPCHistory() ?? {}));
      setRPCHistory(temp);
    })

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
        readOnlyCalls,
        provider,
        rpcHistory,
        connecting,
        account,
        balance,
        extensionActive,
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
