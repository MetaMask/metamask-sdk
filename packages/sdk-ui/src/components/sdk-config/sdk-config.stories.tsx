import type { Meta } from '@storybook/react-native';
import React from 'react';
import { SDKConfig, SDKConfigProps } from './sdk-config';

const SDKConfigMeta: Meta<SDKConfigProps> = {
  component: SDKConfig,
  title: 'SDK UI / SDK Config View',
  argTypes: {},
  args: {
    showQRCode: true,
  },
  decorators: [],
  parameters: {},
};

export default SDKConfigMeta;

export const Primary = {
  args: {},
  component: (args: SDKConfigProps) => <SDKConfig {...args} />,
};
