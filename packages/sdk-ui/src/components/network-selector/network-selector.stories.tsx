import { SDKContext, SDKState } from '@metamask/sdk-react';
import type { Meta } from '@storybook/react-native';
import React from 'react';
import { NetworkSelector, NetworkSelectorProps } from './network-selector';

const NetworkSelectMeta: Meta<NetworkSelectorProps & SDKState> = {
  component: NetworkSelector,
  argTypes: {
    connected: { control: 'boolean' },
    connecting: { control: 'boolean' },
    account: { control: 'text' },
    chainId: { control: 'text' },
    extensionActive: { control: 'boolean' },
  },
  args: {
    connected: true,
    showTestNetworks: true,
  },
  decorators: [
    (Story, sc) => {
      const {
        ready,
        account,
        connected,
        connecting,
        chainId,
        readOnlyCalls,
        extensionActive,
      } = sc.args;
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
          <Story />
        </SDKContext.Provider>
      );
    },
  ],
  parameters: {},
};

export default NetworkSelectMeta;

export const Primary = (args: NetworkSelectorProps & SDKState) => (
  <NetworkSelector {...args} />
);
