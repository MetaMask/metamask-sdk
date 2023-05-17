'use client'
import { MetaMaskSDK, MetaMaskSDKOptions } from '@metamask/sdk';
import { publicProvider } from '@wagmi/core/providers/public';
import React, { createContext } from 'react';
import { Chain, configureChains, Connector, createConfig, mainnet, WagmiConfig } from 'wagmi';
import MetaMaskConnector from './MetaMaskConnector';

const initProps: {
  sdk?: MetaMaskSDK
} = {
}
export const SDKContext = createContext(initProps);

const WagmiWrapper = ({
  children,
  networks,
  sdk,
  connectors = [],
}: {
  children: React.ReactNode;
  networks?: Chain[];
  sdk: MetaMaskSDK;
  connectors?: Connector[];
}) => {

  const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet],
    [publicProvider()],
  )
  const MMConnector = new MetaMaskConnector({ chains: networks, sdk })
  // const client = createClient({
  //   autoConnect: false,
  //   connectors: [MMConnector, ...connectors],
  //   provider: (config) => {
  //     if (!config.chainId) return providers.getDefaultProvider();
  //     const sdkProv = MMConnector.getProviderSync();
  //     return new providers.Web3Provider(
  //       sdkProv,
  //       config.chainId,
  //     );
  //   },
  // });
  const config = createConfig({
    autoConnect: true,
    connectors: [MMConnector, ...connectors],
    publicClient,
  })

  return <WagmiConfig config={config}>{children}</WagmiConfig>;
};

export const MetaMaskProvider = ({
  children,
  sdkOptions,
}: {
  children: React.ReactNode;
  sdkOptions?: MetaMaskSDKOptions;
}) => {
  const sdk = new MetaMaskSDK({
    ...sdkOptions,
  });

  return <SDKContext.Provider value={{ sdk }}><WagmiWrapper sdk={sdk}>{children}</WagmiWrapper></SDKContext.Provider>;
};

export default MetaMaskProvider;
