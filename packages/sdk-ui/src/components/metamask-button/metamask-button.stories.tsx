import { SDKState } from '@metamask/sdk-react';
import type { Meta, StoryObj } from '@storybook/react-native';
import {
  SdkContextDecorator,
  sdkProviderArgTypes,
  defaultSDKtArgs,
} from '../../mocks/storybook.mocks';
import { MetaMaskButton, MetaMaskButtonProps } from './metamask-button';

const MetaMaskButtonMeta: Meta<MetaMaskButtonProps & SDKState> = {
  title: 'SDK UI / MetaMask Button',
  component: MetaMaskButton,
  argTypes: {
    ...sdkProviderArgTypes,
  },
  decorators: [SdkContextDecorator],
  args: {
    ...defaultSDKtArgs,
  },
};

export default MetaMaskButtonMeta;

export const Disconnected: StoryObj<MetaMaskButtonProps & SDKState> = {
  args: {
    ...defaultSDKtArgs,
    connected: false,
  },
};

export const Connected: StoryObj<MetaMaskButtonProps & SDKState> = {
  args: {
    ...defaultSDKtArgs,
    connected: true,
  },
};
