import type { Meta } from '@storybook/react-native';
import React from 'react';
import { ConnectedButton, ConnectedButtonProps } from './connected-button';

const ConnectedButtonMeta: Meta<ConnectedButtonProps> = {
  component: ConnectedButton,
  argTypes: {},
  args: {},
  parameters: {
    deepControls: { enabled: true },
  },
};

export default ConnectedButtonMeta;

export const Primary = (args: ConnectedButtonProps) => (
  <ConnectedButton {...args} />
);
