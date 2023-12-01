import { SDKContext, SDKState } from '@metamask/sdk-react';
import { ArgTypes, Story } from '@storybook/react-native';
import React from 'react';
import NetworkList from '../utils/networks';
import MetaMaskSDK, { SDKProvider } from '@metamask/sdk';
import { KeyExchangeMessageType } from '@metamask/sdk-communication-layer';

export const defaultSDKtArgs: Partial<SDKState> = {
  sdk: {
    getProvider: () => ({}) as SDKProvider,
  } as MetaMaskSDK,
  connected: true,
  connecting: false,
  extensionActive: false,
  chainId: '0x1',
  balance: '11111111111111111',
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
  balance: {
    control: 'text',
    defaultValue: defaultSDKtArgs.balance,
  },
  chainId: {
    control: 'select',
    options: chainIdOptions,
    defaultValue: defaultSDKtArgs.chainId,
  },
  keyExchangeStep: {
    control: 'select',
    options: KeyExchangeMessageType,
    defaultValue: KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
  },
  rpcHistory: {
    control: 'object',
    defaultValue: {},
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
    balance,
    readOnlyCalls,
    extensionActive,
    rpcHistory,
    keyExchangeStep,
  } = sc.args;

  const status: SDKState['status'] = {
    keyInfo: {
      keysExchanged: true,
      ecies: {
        private: 'aaa',
        public: 'bbb',
        otherPubKey: 'ccc',
      },
      step: keyExchangeStep,
    },
  };
  console.log('sc.args', sc.args);
  return (
    <SDKContext.Provider
      value={{
        ready,
        extensionActive,
        balance,
        connected,
        readOnlyCalls,
        connecting,
        account,
        chainId,
        rpcHistory,
        status,
      }}
    >
      <ThisStory />
    </SDKContext.Provider>
  );
};
