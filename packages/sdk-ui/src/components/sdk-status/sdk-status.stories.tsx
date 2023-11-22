import type { Meta } from '@storybook/react-native';
import React from 'react';
import { SDKStatus, SDKStatusProps } from './sdk-status';

const SDKStatusMeta: Meta<SDKStatusProps> = {
  component: SDKStatus,
  title: 'SDK UI / SDK Status',
  argTypes: {},
  args: {},
  decorators: [],
  parameters: {},
};

export default SDKStatusMeta;

export const Primary = {
  args: {},
  component: (args: SDKStatusProps) => <SDKStatus {...args} />,
};
