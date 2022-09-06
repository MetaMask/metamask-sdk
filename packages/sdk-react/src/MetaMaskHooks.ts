import { useState } from 'react';
import {
  // eslint-disable-next-line import/named
  Chain,
  useClient,
  useConnect as useConnectWagmi,
  useNetwork,
} from 'wagmi';

// eslint-disable-next-line import/export
export * from 'wagmi';

// eslint-disable-next-line import/export
export const useConnect = () => {
  const client = useClient();
  const connector = client.connectors[0];

  return useConnectWagmi({ connector });
};

type AddEthereumChainParameter = {
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

export const useSwitchOrAddNetwork = () => {
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [pendingChainId, setPendingChainId] = useState<number>();
  const client = useClient();
  const connector = client.connectors[0];
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

        params.rpcUrls = rpcUrls;

        try {
          response = await provider.request({
            method: 'wallet_addEthereumChain',
            params: [params],
          });
        } catch (addError) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setError(addError);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
