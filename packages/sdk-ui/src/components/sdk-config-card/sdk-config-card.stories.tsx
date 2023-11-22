import type { Meta } from '@storybook/react-native';
import React from 'react';
import { SDKConfigCard, SDKConfigCardProps } from './sdk-config-card';

const SDKConfigCardMeta: Meta<SDKConfigCardProps> = {
  component: SDKConfigCard,
  title: 'SDK UI / SDK Config Card',
  argTypes: {},
  args: {
    startVisible: true,
  },
  decorators: [],
  parameters: {},
};

export default SDKConfigCardMeta;

export const Primary = {
  args: {},
  component: (args: SDKConfigCardProps) => <SDKConfigCard {...args} />,
};
