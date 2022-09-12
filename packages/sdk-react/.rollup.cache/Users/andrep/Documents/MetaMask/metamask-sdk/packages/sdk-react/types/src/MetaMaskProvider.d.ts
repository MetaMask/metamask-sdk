import React from 'react';
import { Chain, Connector } from 'wagmi';
import { MetaMaskSDKOptions as MetaMaskSDKOptionsProps } from '@metamask/sdk';
declare const MetaMaskProvider: ({ children, networks, MetaMaskSDKOptions, connectors, }: {
    children: React.ReactNode;
    networks: Chain[];
    MetaMaskSDKOptions?: MetaMaskSDKOptionsProps | undefined;
    connectors?: Connector<any, any, any>[] | undefined;
}) => JSX.Element;
export default MetaMaskProvider;
