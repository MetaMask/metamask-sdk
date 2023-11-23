import { SDKContext, SDKState } from '@metamask/sdk-react';
import { ArgTypes, Story } from '@storybook/react-native';
import React from 'react';
import NetworkList from '../utils/networks';
import MetaMaskSDK, { SDKProvider } from '@metamask/sdk';

export const defaultSDKtArgs: Partial<SDKState> = {
  sdk: {
    getProvider: () => ({}) as SDKProvider,
  } as MetaMaskSDK,
  connected: true,
  connecting: false,
  extensionActive: false,
  chainId: '0x1',
  account: '0xAAAAA0e296961f476E01184274Ce85ae60184CB0',
};

const chainIdOptions = Object.keys(NetworkList).reduce<{
  [key: string]: string;
}>((options, key) => {
  const network = NetworkList[key];
  console.log(`key: ${key}`, network);
  options[network.name] = network.hexChainId;
  return options;
}, {});

export const sdkProviderArgTypes: ArgTypes<Partial<SDKState>> = {
  connected: { control: 'boolean' },
  connecting: { control: 'boolean' },
  account: {
    control: 'text',
    defaultValue: defaultSDKtArgs.account,
  },
  chainId: {
    control: 'select',
    options: chainIdOptions,
    defaultValue: defaultSDKtArgs.chainId,
  },
  extensionActive: { control: 'boolean' },
};

export const SdkContextDecorator = (ThisStory: Story, sc: any) => {
  const {
    ready,
    account,
    connected,
    connecting,
    chainId,
    readOnlyCalls,
    extensionActive,
  } = sc.args;
  console.log('sc.args', sc.args);
  return (
    <SDKContext.Provider
      value={{
        ready,
        extensionActive,
        connected,
        readOnlyCalls,
        connecting,
        account,
        chainId,
      }}
    >
      <ThisStory />
    </SDKContext.Provider>
  );
};
