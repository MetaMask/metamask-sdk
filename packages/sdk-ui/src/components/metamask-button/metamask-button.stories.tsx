import type { Meta } from '@storybook/react-native';
import React from 'react';
import { MetaMaskButton, MetaMaskButtonProps } from './metamask-button';

const MetaMaskButtonMeta: Meta<MetaMaskButtonProps> = {
  component: MetaMaskButton,
  argTypes: {},
  args: {},
  parameters: {
    deepControls: { enabled: true },
  },
};

export default MetaMaskButtonMeta;

export const Disconnected = (args: MetaMaskButtonProps) => (
  <MetaMaskButton {...args} />
);

export const Connected = (args: MetaMaskButtonProps) => (
  <MetaMaskButton
    {...args}
    _sdkState={{ connected: true, account: '0x1223444' }}
  />
);
