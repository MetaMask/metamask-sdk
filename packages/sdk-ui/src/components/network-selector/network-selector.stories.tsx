import { SDKState } from '@metamask/sdk-react';
import type { Meta, StoryObj } from '@storybook/react-native';
import {
  SdkContextDecorator,
  sdkProviderArgTypes,
} from '../../mocks/storybook.mocks';
import { NetworkSelector, NetworkSelectorProps } from './network-selector';

const NetworkSelectMeta: Meta<NetworkSelectorProps & SDKState> = {
  title: 'SDK UI / Network Selector',
  component: NetworkSelector,
  argTypes: {
    ...sdkProviderArgTypes,
  },
  args: {
    connected: true,
    showTestNetworks: true,
  },
  decorators: [SdkContextDecorator],
  parameters: {},
};

export default NetworkSelectMeta;

export const Primary: StoryObj<NetworkSelectorProps & SDKState> = {
  args: {
    connected: true,
    chainId: '0x1',
    account: '0xAAAAA0e296961f476E01184274Ce85ae60184CB0',
  },
};
