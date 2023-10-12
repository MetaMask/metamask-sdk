'use client';
import {
  EventType,
  MetaMaskSDK,
  MetaMaskSDKOptions,
  PROVIDER_UPDATE_TYPE,
  SDKProvider,
  ServiceStatus,
} from '@metamask/sdk';
import { EthereumRpcError } from 'eth-rpc-errors';
import React, { createContext, useEffect, useRef, useState } from 'react';

const initProps: {
  sdk?: MetaMaskSDK;
  ready: boolean;
  connected: boolean;
  connecting: boolean;
  // Allow querying blockchain while wallet isn't connected
  readOnlyCalls: boolean;
  provider?: SDKProvider;
  error?: EthereumRpcError<unknown>;
  chainId?: string;
  account?: string;
  status?: ServiceStatus;
} = {
  ready: false,
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

    const activeProvider = sdk.getProvider();
    setConnected(activeProvider.isConnected());
    setAccount(activeProvider.selectedAddress || undefined);
    setProvider(activeProvider);

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
      setAccount(activeProvider?.selectedAddress || undefined);
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
      setConnecting(false);
      setError(undefined);
    };

    const onChainChanged = (networkVersionOrChainId: any) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::provider on 'chainChanged' event.`,
          networkVersionOrChainId,
        );
      }
      // check if networkVersion has correct format
      if (
        typeof networkVersionOrChainId === 'object' &&
        networkVersionOrChainId?.chainId
      ) {
        setChainId(networkVersionOrChainId.chainId);
      } else {
        setChainId(networkVersionOrChainId);
      }

      setConnected(true);
      setConnecting(false);
      setError(undefined);
    };

    const onSDKStatusEvent = (_serviceStatus: ServiceStatus) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::sdk on '${EventType.SERVICE_STATUS}/${_serviceStatus.connectionStatus}' event.`,
          _serviceStatus,
        );
      }
      setStatus(_serviceStatus);
    };

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

    const onProviderEvent = (type: PROVIDER_UPDATE_TYPE) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::sdk on '${EventType.PROVIDER_UPDATE}' event.`,
          type,
        );
      }
      if (type === PROVIDER_UPDATE_TYPE.TERMINATE) {
        setConnecting(false);
      } else if (type === PROVIDER_UPDATE_TYPE.EXTENSION) {
        setConnecting(false);
        setConnected(true);
        setError(undefined);
      }
      setTrigger((_trigger) => _trigger + 1);
    };
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
