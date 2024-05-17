import debugPackage from 'debug';
import { EthereumRpcError } from 'eth-rpc-errors';
import React, {
  createContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { logger } from './utils/logger';

import { NativeModules } from 'react-native';
const { MetaMaskReactNativeSdk } = NativeModules;

export interface EventHandlerProps {
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setChainId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  debug?: boolean;
  synced?: boolean;
  chainId?: string;
}

export interface SDKState {
  ready: boolean;
  connected: boolean;
  connecting: boolean;
  extensionActive: boolean;
  // Allow querying blockchain while wallet isn't connected
  readOnlyCalls: boolean;
  channelId?: string;
  error?: EthereumRpcError<unknown>;
  chainId?: string;
  balance?: string; // hex value in wei
  balanceProcessing?: boolean;
  account?: string;
  syncing?: boolean;
}

// TODO: change this to the actual sdk params after implementing the native sdk
export interface MetaMaskSDKOptions {
  // Enable debug logs
  debug?: boolean;

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
  const [ready, setReady] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<string>();
  const [account, setAccount] = useState<string>();

  const hasInit = useRef(false);

  useEffect(() => {
    // Enable debug logs
    debugPackage.enable('MM_SDK-React');
  }, [debug]);


  useEffect(() => {
    const currentAddress = MetaMaskReactNativeSdk.selectedAddress;

    if (currentAddress && currentAddress != account?.toLowerCase()) {
      logger(
        `[MetaMaskProviderClient] account changed detected from ${account} to ${currentAddress}`,
      );

      setAccount(currentAddress);
    }
  }, [MetaMaskReactNativeSdk.selectedAddress]);


  useEffect(() => {
    // Prevent sdk double rendering with StrictMode
    if (hasInit.current) {
      logger(`[MetaMaskProviderClient] sdk already initialized`);

      return;
    }

    hasInit.current = true;

    // TODO: change to connect to the native sdk
    const _sdk = undefined

    // TODO: check if still needed after implementing the native sdk
    setReady(true);

  }, [sdkOptions]);

  useEffect(() => {
    if (!ready) {
      return;
    }


    // TODO: change to connect to the native sdk
    setConnected(MetaMaskReactNativeSdk.isConnected);
    setAccount(MetaMaskReactNativeSdk.selectedAddress || undefined);
    setChainId(MetaMaskReactNativeSdk.chainId || undefined);
  }, [ready]);

  return (
    <SDKContext.Provider
      value={{
        sdk :{
          // TODO: after we have the native interface, fill this object with methods
          connect: () => null
        },
        ready,
        connected,
        connecting,
        account,
        chainId,
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
