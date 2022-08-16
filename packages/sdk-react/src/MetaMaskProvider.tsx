import React from 'react';
import { WagmiConfig, createClient, Chain } from 'wagmi';
import { providers } from 'ethers';
import MetaMaskConnector from './MetaMaskConnector';

const MetaMaskProvider = ({
  children,
  networks,
}: {
  children: React.ReactNode;
  networks: Chain[];
}) => {
  const MMConnector = new MetaMaskConnector({
    chains: networks,
  });

  const client = createClient({
    autoConnect: true,
    connectors: [MMConnector],
    provider: (config) => {
      if (!config.chainId) return providers.getDefaultProvider();
      return new providers.Web3Provider(
        MMConnector.getProviderSync(),
        config.chainId,
      );
    },
  });

  return <WagmiConfig client={client}>{children}</WagmiConfig>;
};

export default MetaMaskProvider;
