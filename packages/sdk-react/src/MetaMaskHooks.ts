import { useContext, useState } from 'react';
import {
  Chain,
  useConfig,
  useNetwork,
  useAccount as useAccountWagmi,
  useConnect as useConnectWagmi,
} from 'wagmi';
import { SDKContext } from './MetaMaskProvider';

export * from 'wagmi';

export const useAccount = () => {
  const wagmiRes = useAccountWagmi();
  console.debug(`useAccount wagmi`, wagmiRes);
  return wagmiRes;
}

export const useConnect = () => {
  const config = useConfig();
  console.debug(`initialize useConnect`, config.connectors)
  const connector = config.connectors[0];

  const wagmiRes = useConnectWagmi({ connector });
  console.debug(`useConnect wagmi`, wagmiRes)
  return wagmiRes;
};

interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency?: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: number;
  };
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
};

export const useSDK = () => {
  const context = useContext(SDKContext);

  if (context === undefined) {
    throw new Error('SDK context is missing, must be within provide');
  }
  return context;
};

export const useSwitchOrAddNetwork = () => {
  const [error, setError] = useState<unknown>();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [pendingChainId, setPendingChainId] = useState<number>();
  const config = useConfig();
  const connector = config.connectors[0];
  const { chains } = useNetwork();
  const switchOrAddNetwork = async (chain: Chain) => {
    let response;

    setPendingChainId(chain.id);
    const provider = await connector.getProvider();
    setIsLoading(true);
    try {
      response = await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chain.id.toString(16)}` }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      // FIXME remove ALL ts-ignore below
      if (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        switchError.code === 4902 ||
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        switchError?.data?.originalError?.code === 4902
      ) {
        const params: AddEthereumChainParameter = {
          chainId: `0x${chain.id.toString(16)}`,
          chainName: chain.name,
          nativeCurrency: chain.nativeCurrency,
        };

        const rpcUrls = [];

        if (chain.rpcUrls.default) {
          rpcUrls.push(chain.rpcUrls.default);
        }

        if (chain.rpcUrls.infura) {
          rpcUrls.push(chain.rpcUrls.infura);
        }

        if (chain.rpcUrls.public) {
          rpcUrls.push(chain.rpcUrls.public);
        }

        if (chain.blockExplorers) {
          params.blockExplorerUrls = [chain.blockExplorers?.default?.url];
        }

        // TODO handle rpcUrls
        // params.rpcUrls = rpcUrls;

        try {
          response = await provider.request({
            method: 'wallet_addEthereumChain',
            params: [params],
          });
        } catch (addError) {
          setError(addError);
        }
      } else {
        setError(switchError);
      }
    }

    setIsLoading(false);
    return response;
  };

  return {
    chains,
    error,
    isLoading,
    pendingChainId,
    switchOrAddNetwork,
  };
};
