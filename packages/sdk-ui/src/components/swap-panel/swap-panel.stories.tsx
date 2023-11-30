import type { Meta } from '@storybook/react-native';
import React from 'react';
import { SwapPanel, SwapPanelProps } from './swap-panel';
import { SDKState } from '@metamask/sdk-react';
import {
  SdkContextDecorator,
  sdkProviderArgTypes,
} from '../../mocks/storybook.mocks';

const SwapPanelMeta: Meta<SwapPanelProps & SDKState> = {
  component: SwapPanel,
  title: 'SDK UI / Swap Panel',
  argTypes: {
    ...sdkProviderArgTypes,
  },
  decorators: [SdkContextDecorator],
  parameters: {},
};

export default SwapPanelMeta;

export const Primary = {
  args: {
    connected: true,
    chainId: '0x1',
    balance: '11111111111111111',
    account: '0xAAAAA0e296961f476E01184274Ce85ae60184CB0',
  },
  component: (args: SwapPanelProps) => <SwapPanel {...args} />,
};
