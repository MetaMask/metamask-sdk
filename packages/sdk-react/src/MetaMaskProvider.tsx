'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { WagmiConfig, createClient, Chain, Connector } from 'wagmi';
import { providers } from 'ethers';
import MetaMaskConnector from './MetaMaskConnector';
import { EventType, MetaMaskSDK, MetaMaskSDKOptions, ServiceStatus } from '@metamask/sdk';
import { useSDK } from './MetaMaskHooks';

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
  const MMConnector = new MetaMaskConnector({ chains: networks, sdk })
  const client = createClient({
    autoConnect: false,
    connectors: [MMConnector, ...connectors],
    provider: (config) => {
      if (!config.chainId) return providers.getDefaultProvider();
      const sdkProv = MMConnector.getProviderSync();
      return new providers.Web3Provider(
        sdkProv,
        config.chainId,
      );
    },
  });

  return <WagmiConfig client={client}>{children}</WagmiConfig>;
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
