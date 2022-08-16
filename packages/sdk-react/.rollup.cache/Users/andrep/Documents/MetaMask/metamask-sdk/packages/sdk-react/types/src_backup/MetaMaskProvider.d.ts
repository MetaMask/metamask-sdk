import React from 'react';
import { Chain } from 'wagmi';
declare const MetaMaskProvider: ({ children, networks, }: {
    children: React.ReactNode;
    networks: Chain[];
}) => JSX.Element;
export default MetaMaskProvider;
