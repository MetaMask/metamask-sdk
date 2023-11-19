import type { Meta } from '@storybook/react-native';
import React from 'react';
import { NetworkSelector, NetworkSelectorProps } from './network-selector';

const NetworkSelectMeta: Meta<NetworkSelectorProps> = {
  component: NetworkSelector,
  argTypes: {},
  args: {},
  parameters: {
    deepControls: { enabled: true },
  },
};

export default NetworkSelectMeta;

export const Primary = (args: NetworkSelectorProps) => (
  <NetworkSelector {...args} showTestNetworks={true} />
);
