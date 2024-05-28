import React, { createContext, useEffect, useRef, useState } from 'react';
import {
  RequestArguments,
  batchRequest,
  connect,
  connectAndSign,
  connectWith,
  getChainId,
  getSelectedAddress,
  initializeSDK,
  request,
  terminate,
} from './NativePackageMethods';
import { Alert } from 'react-native';

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
  channelId?: string;
  chainId?: string;
  account?: string;
  sdk?: {
    connect: () => Promise<string | undefined>;
    connectAndSign: ({ msg }: { msg: string }) => Promise<string | undefined>;
    connectWith: (req: RequestArguments) => Promise<string | undefined>;
    terminate: () => Promise<void>;
  };
  provider?: {
    request: (req: RequestArguments) => Promise<unknown>;
    batchRequest: (requests: RequestArguments[]) => Promise<unknown[]>;
    getChainId: () => Promise<string | undefined>;
    getSelectedAddress: () => Promise<string | undefined>;
  };
}

export interface MetaMaskSDKOptions {
  dappMetadata: {
    name: string;
    url: string;
    iconUrl: string;
    scheme: string;
  };
  infuraAPIKey: string;
}

const initProps: SDKState = {
  ready: false,
  connected: false,
  connecting: false,
};

export const SDKContext = createContext(initProps);

const MetaMaskProviderClient = ({
  children,
  sdkOptions,
}: {
  children: React.ReactNode;
  sdkOptions: MetaMaskSDKOptions;
}) => {
  const [ready, setReady] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<string>();
  const [account, setAccount] = useState<string>();

  const syncAccountAndChianId = async () => {
    const selectedAddress = await getSelectedAddress();
    const currentChainId = await getChainId();

    setAccount(selectedAddress || undefined);
    setChainId(currentChainId || undefined);
  };

  const handleConnect = async () => {
    setConnecting(true);

    const res = await connect();

    await syncAccountAndChianId();

    setConnected(true);
    setConnecting(false);

    return res;
  };

  const handleConnectAndSign = async ({ msg }: { msg: string }) => {
    setConnecting(true);

    const res = await connectAndSign(msg);
    await syncAccountAndChianId();

    setConnected(true);
    setConnecting(false);
    return res;
  };

  const handleConnectWith = async (req: RequestArguments) => {
    setConnecting(true);

    const res = await connectWith(req);

    await syncAccountAndChianId();

    setConnected(true);
    setConnecting(false);

    return res;
  };

  const handleTerminate = async () => {
    await terminate();

    setAccount(undefined);
    setChainId(undefined);
    setConnected(false);
    setConnecting(false);
  };

  const handleRequest = async (req: RequestArguments) => {
    try {


    const res = await request(req);

    return res;
  } catch (error: any) {
    const isAccountOrChainIdError = error.message === 'The selected account or chain has changed. Please try again.'

    if (isAccountOrChainIdError) {
      Alert.alert('Error', 'The selected account or chain has changed. Please try again.')
    }

    throw error;
  } finally {
    await syncAccountAndChianId();
  }
  };

  const handleBatchRequest = async (requests: RequestArguments[]) => {
    try {
      const res = await batchRequest(requests);
      await syncAccountAndChianId();

      return res;
    } catch (error: any) {
      const isAccountOrChainIdError = error.message === 'The selected account or chain has changed. Please try again.'

      if (isAccountOrChainIdError) {
        Alert.alert('Error', 'The selected account or chain has changed. Please try again.')
      }

      throw error;
    } finally {
      await syncAccountAndChianId();
    }
  };

  const hasInit = useRef(false);

  useEffect(() => {
    // Prevent sdk double rendering with StrictMode
    if (hasInit.current) {
      return;
    }

    initializeSDK(sdkOptions);

    hasInit.current = true;

    setReady(true);
  }, [sdkOptions]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const onReady = async () => {
      const selectedAddress = await getSelectedAddress();
      const currentChainId = await getChainId();

      setConnected(Boolean(selectedAddress));
      setAccount(selectedAddress || undefined);
      setChainId(currentChainId || undefined);
    };

    onReady();
  }, [ready]);

  return (
    <SDKContext.Provider
      value={{
        sdk: {
          connect: handleConnect,
          connectAndSign: handleConnectAndSign,
          connectWith: handleConnectWith,
          terminate: handleTerminate,
        },
        provider: {
          request: handleRequest,
          batchRequest: handleBatchRequest,
          getSelectedAddress,
          getChainId,
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
}: {
  children: React.ReactNode;
  sdkOptions: MetaMaskSDKOptions;
}) => {
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    setClientSide(true);
  }, []);

  return (
    <>
      {clientSide ? (
        <MetaMaskProviderClient sdkOptions={sdkOptions}>
          {children}
        </MetaMaskProviderClient>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default MetaMaskProvider;
