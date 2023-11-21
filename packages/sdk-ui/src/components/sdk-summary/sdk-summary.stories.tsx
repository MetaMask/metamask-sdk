import type { Meta } from '@storybook/react-native';
import React from 'react';
import { SDKSummary, SDKSummaryProps } from './sdk-summary';
import { SDKState } from '@metamask/sdk-react';
import {
  SdkContextDecorator,
  sdkProviderArgTypes,
} from '../../mocks/storybook.mocks';

const SDKSummaryMeta: Meta<SDKSummaryProps & SDKState> = {
  component: SDKSummary,
  title: 'SDK UI / Summary View',
  argTypes: {
    ...sdkProviderArgTypes,
  },
  decorators: [SdkContextDecorator],
  parameters: {},
};

export default SDKSummaryMeta;

export const Primary = {
  args: {
    connected: true,
    chainId: '0x1',
    account: '0xAAAAA0e296961f476E01184274Ce85ae60184CB0',
  },
  component: (args: SDKSummaryProps) => <SDKSummary {...args} />,
};
