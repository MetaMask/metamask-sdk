import React from 'react';
export interface Account {
    address: string;
    balance?: string;
}
interface Props {
    color?: 'blue' | 'white' | 'orange';
    theme?: 'dark' | 'light';
    shape?: 'rectangle' | 'rounded' | 'rounded-full';
    icon?: 'original' | 'simplified' | 'no-icon';
    iconPosition?: 'left' | 'right';
    text?: 'Connect wallet' | 'MetaMask' | 'Connect with MetaMask' | string;
    textAlign?: 'middle' | 'left';
    buttonStyle?: any;
    textStyle?: any;
    iconStyle?: any;
    removeDefaultStyles?: boolean;
    connectComponent?: React.ReactNode;
    wrongNetworkComponent?: React.ReactNode;
    wrongNetworkText?: 'Wrong network' | 'Switch network' | string;
    connectedComponent?: React.ReactNode;
    connectedType?: 'custom-text' | 'network-account-balance' | 'network-account' | 'account-balance' | 'separate-network-account';
    connectedText?: 'Connected';
}
declare const MetaMaskButton: ({ color, theme, shape, icon, iconPosition, text, textAlign, buttonStyle, textStyle, iconStyle, removeDefaultStyles, connectComponent, wrongNetworkComponent, wrongNetworkText, connectedComponent, connectedType, }: Props) => JSX.Element;
export default MetaMaskButton;
