import { EthereumRpcError } from 'eth-rpc-errors';
import React, {
  createContext,
  useEffect,
  useRef,
  useState
} from 'react';
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
  terminate
} from './NativePackageMethods';



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
  error?: EthereumRpcError<unknown>;
  chainId?: string;
  balance?: string; // hex value in wei
  balanceProcessing?: boolean;
  account?: string;
  syncing?: boolean;
  sdk?: {
    connect: () => Promise<string | undefined>;
    connectAndSign: (message: string) => Promise<string | undefined>;
    connectWith: (req: RequestArguments) => Promise<string | undefined>;
    terminate: () => Promise<void>;
    request: <Type>(req: RequestArguments) => Promise<Type>;
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
  }
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

  const handleConnect = async () => {
    try {
    setConnecting(true);

    const res = await connect()

    const selectedAddress = await getSelectedAddress()
    const currentChainId = await getChainId()

    setAccount(selectedAddress);
    setChainId(currentChainId);
    setConnected(true);
    setConnecting(false);

    return res;
    } catch (error) {
      console.error('Error:', error);
    }
  }


  const handleConnectAndSign = async (message:string) => {
    try {
    setConnecting(true);

    const res = await connectAndSign(message)

    setConnected(true);
    setConnecting(false);
    return res;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleConnectWith = async (req: RequestArguments) => {
    try {
    setConnecting(true);

    const res = await connectWith(req)

    setConnected(true);
    setConnecting(false);

    return res;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleTerminate = async () => {
    try {
    await terminate()

    setAccount(undefined);
    setChainId(undefined);
    setConnected(false);
    setConnecting(false);
    } catch (error) {
      console.error('Error:', error);
    }
  }

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
      const selectedAddress = await getSelectedAddress()
      const currentChainId = await getChainId()

      setConnected(!!selectedAddress);
      setAccount(selectedAddress || undefined);
      setChainId(currentChainId || undefined);
    }

    onReady()
  }, [ready]);

  return (
    <SDKContext.Provider
      value={{
        sdk : {
          connect: handleConnect,
          connectAndSign: handleConnectAndSign,
          connectWith: handleConnectWith,
          terminate: handleTerminate,
          request,
          batchRequest,
          getChainId,
          getSelectedAddress,
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
        <MetaMaskProviderClient  sdkOptions={sdkOptions}>
          {children}
        </MetaMaskProviderClient>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default MetaMaskProvider;

