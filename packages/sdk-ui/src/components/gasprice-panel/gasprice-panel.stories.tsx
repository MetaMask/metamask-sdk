import type { Meta } from '@storybook/react-native';
import React from 'react';
import { GasPricePanel, GasPricePanelProps } from './gasprice-panel';
import { SDKState } from '@metamask/sdk-react';
import {
  SdkContextDecorator,
  sdkProviderArgTypes,
} from '../../mocks/storybook.mocks';

const SwapPanelMeta: Meta<GasPricePanelProps & SDKState> = {
  component: GasPricePanel,
  title: 'SDK UI / GasPrice Panel',
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
  component: (args: GasPricePanelProps) => <GasPricePanel {...args} />,
};
