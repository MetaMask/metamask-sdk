import type { Meta } from '@storybook/react-native';
import React from 'react';
import { ConnectButton, ConnectButtonProps } from './connect-button';

const ConnectButtonMeta: Meta<ConnectButtonProps> = {
  component: ConnectButton,
  argTypes: {},
  args: {},
  parameters: {
    deepControls: { enabled: true },
  },
};

export default ConnectButtonMeta;

export const Primary = (args: ConnectButtonProps) => (
  <ConnectButton {...args} />
);
