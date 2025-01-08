'use client';
import {
  ConnectionStatus,
  EventType,
  MetaMaskSDK,
  MetaMaskSDKOptions, RPCMethodCache, RPCMethodResult, SDKProvider,
  ServiceStatus
} from '@metamask/sdk';
import debugPackage from 'debug';
import { EthereumRpcError } from 'eth-rpc-errors';
import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useHandleAccountsChangedEvent } from './EventsHandlers/useHandleAccountsChangedEvent';
import { useHandleChainChangedEvent } from './EventsHandlers/useHandleChainChangedEvent';
import { useHandleConnectEvent } from './EventsHandlers/useHandleConnectEvent';
import { useHandleDisconnectEvent } from './EventsHandlers/useHandleDisconnectEvent';
import { useHandleInitializedEvent } from './EventsHandlers/useHandleInitializedEvent';
import { useHandleOnConnectingEvent } from './EventsHandlers/useHandleOnConnectingEvent';
import { useHandleProviderEvent } from './EventsHandlers/useHandleProviderEvent';
import { useHandleSDKStatusEvent } from './EventsHandlers/useHandleSDKStatusEvent';
import { useHandleTerminateEvent } from './EventsHandlers/useHandleTerminateEvent';
import { logger } from './utils/logger';

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
  synced?: boolean;
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
  channelId?: string;
  error?: EthereumRpcError<unknown>;
  chainId?: string;
  balance?: string; // hex value in wei
  balanceProcessing?: boolean;
  account?: string;
  status?: ServiceStatus;
  rpcHistory?: RPCMethodCache;
  syncing?: boolean;
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

  const [lastRpcId, setLastRpcId] = useState<string>('');
  const [ready, setReady] = useState<boolean>(false);
  const [readOnlyCalls, setReadOnlyCalls] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [trigger, setTrigger] = useState<number>(1);
  const [chainId, setChainId] = useState<string>();
  const [balance, setBalance] = useState<string>();
  const [balanceProcessing, setBalanceProcessing] = useState<boolean>(false);
  const [balanceQuery, setBalanceQuery] = useState<string>('');
  const [account, setAccount] = useState<string>();
  const [channelId, setChannelId] = useState<string>();
  const [error, setError] = useState<EthereumRpcError<unknown>>();
  const [provider, setProvider] = useState<SDKProvider>();
  const [status, setStatus] = useState<ServiceStatus>();
  const [rpcHistory, setRPCHistory] = useState<RPCMethodCache>({});
  const [extensionActive, setExtensionActive] = useState<boolean>(false);
  const hasInit = useRef(false);

  useEffect(() => {
    // Enable debug logs
    debugPackage.enable('MM_SDK-React');
  }, [debug]);

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
    activeProvider: undefined,
    sdk,
  };

  const onConnecting = useHandleOnConnectingEvent(eventHandlerProps);

  // FIXME calling directly useHandleInitializedEvent skip the parameter of the event.
  const onInitialized = useHandleInitializedEvent(eventHandlerProps);

  const onConnect = useHandleConnectEvent(eventHandlerProps);

  const onDisconnect = useHandleDisconnectEvent(eventHandlerProps);
  
  const onTerminate = useHandleTerminateEvent(eventHandlerProps);

  const onAccountsChanged = useHandleAccountsChangedEvent(eventHandlerProps);

  const onChainChanged = useHandleChainChangedEvent(eventHandlerProps);

  const onSDKStatusEvent = useHandleSDKStatusEvent(eventHandlerProps);

  const onProviderEvent = useHandleProviderEvent(eventHandlerProps);

  const syncing = useMemo(() => {
    const socketDisconnected =
      status?.connectionStatus === ConnectionStatus.DISCONNECTED;

    // Syncing if rpc calls have been unprocessed
    let pendingRpcs = false;
    for (const rpcId in rpcHistory) {
      const rpc = rpcHistory[rpcId];
      if (rpc.result === undefined && rpc.error === undefined) {
        pendingRpcs = true;
        if (socketDisconnected) {
          console.warn(
            `[MetamaskProvider] socket disconnected but rpc ${rpcId} not processed yet`,
          );
          // TODO should we force the error has timeout here?
        }
        break;
      }
    }

    return pendingRpcs;
  }, [rpcHistory, status]);

  useEffect(() => {
    const currentAddress = provider?.getSelectedAddress()

    if (currentAddress && currentAddress != account?.toLowerCase()) {
      logger(
        `[MetaMaskProviderClient] account changed detected from ${account} to ${currentAddress}`,
      );

      setAccount(currentAddress);
    }
  }, [rpcHistory]);

  // Sync connection status with the provider
  useEffect(() => {
    if (status?.connectionStatus === ConnectionStatus.DISCONNECTED || status?.connectionStatus === ConnectionStatus.TERMINATED) {
      setConnected(false);
      setConnecting(false);
    }
  }, [status]);

  useEffect(() => {
    // avoid asking balance multiple times on same account/chain
    const currentBalanceQuery = `${account}${chainId}`;
    setChannelId(sdk?.getChannelId());

    if (
      account?.startsWith('0x') &&
      chainId?.startsWith('0x') &&
      currentBalanceQuery !== balanceQuery
    ) {
      // Retrieve balance of account
      setBalanceProcessing(true);
      logger(
        `[MetaMaskProviderClient] retrieving balance of ${account} on chain ${chainId}`,
      );

      setBalanceQuery(currentBalanceQuery);
      provider?.request({
          method: 'eth_getBalance',
          params: [account, 'latest'],
        })
        .then((accountBalance: unknown) => {
          logger(
            `[MetaMaskProviderClient] balance of ${account} is ${accountBalance}`,
          );

          setBalance(accountBalance as string);
        })
        .catch((err: any) => {
          console.warn(
            `[MetamaskProvider] error retrieving balance of ${account}`,
            err,
          );
        })
        .finally(() => {
          setBalanceProcessing(false);
        });
    } else {
      setBalance(undefined);
    }
  }, [account, provider, chainId, balanceQuery]);

  useEffect(() => {
    // Prevent sdk double rendering with StrictMode
    if (hasInit.current) {
      logger(`[MetaMaskProviderClient] sdk already initialized`);

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
    }).catch((err) => {
      console.error(`[MetaMaskProviderClient] error initializing SDK`, err);
    });

  }, [sdkOptions]);

  useEffect(() => {
    if (!ready || !sdk) {
      return;
    }

    logger(`[MetaMaskProviderClient] init SDK Provider listeners`, sdk);

    setExtensionActive(sdk.isExtensionActive());

    const activeProvider = sdk.getProvider();
    if(!activeProvider) {
      console.warn(`[MetaMaskProviderClient] activeProvider is undefined.`);
      return;
    }

    const isConnected = sdk.isExtensionActive()
      ? !!account && account.length > 0
      : activeProvider.isConnected();

    setConnected(isConnected);
    setAccount(activeProvider.getSelectedAddress() || undefined);
    setProvider(activeProvider);
    setChainId(activeProvider.getChainId() || undefined);

    activeProvider.on('_initialized', onInitialized);
    activeProvider.on('terminate', onTerminate);
    activeProvider.on('connecting', onConnecting);
    activeProvider.on('connect', onConnect);
    activeProvider.on('disconnect', onDisconnect);
    activeProvider.on('accountsChanged', onAccountsChanged);
    activeProvider.on('chainChanged', onChainChanged);
    sdk.on(EventType.SERVICE_STATUS, onSDKStatusEvent);

    sdk
      ._getConnection()
      ?.getConnector()
      .on(EventType.RPC_UPDATE, (rpc: RPCMethodResult) => {
        const completed = rpc.result !== undefined || rpc.error !== undefined;
        if (!completed) {
          // Only update lastRpcId to keep track of last answered rpc id
          setLastRpcId(rpc.id);
        } else if (rpc.id === lastRpcId) {
          setLastRpcId(''); // Reset lastRpcId
        }
        // hack to force a react re-render when the RPC cache is updated
        const temp = JSON.parse(JSON.stringify(sdk.getRPCHistory() ?? {}));
        setRPCHistory(temp);
      });

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
        channelId,
        account,
        balance,
        balanceProcessing,
        extensionActive,
        chainId,
        error,
        status,
        syncing,
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
