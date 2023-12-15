import React from 'react';
import { SDKState } from '@metamask/sdk-react';
import type { Meta, StoryObj } from '@storybook/react-native';
import {
  SdkContextDecorator,
  sdkProviderArgTypes,
  defaultSDKtArgs,
} from '../../mocks/storybook.mocks';
import {
  FloatingMetaMaskButton,
  FloatingMetaMaskButtonProps,
} from './floating-metamask-button';
import { View } from 'react-native';

const FloatingMetaMaskButtonMeta: Meta<FloatingMetaMaskButtonProps & SDKState> =
  {
    title: 'SDK UI / Floating MetaMask Button',
    component: FloatingMetaMaskButton,
    argTypes: {
      ...sdkProviderArgTypes,
    },
    decorators: [
      SdkContextDecorator,
      (Story) => (
        <View style={{ margin: 20, height: 300, backgroundColor: 'lightgrey' }}>
          <Story />
        </View>
      ),
    ],
    args: {
      ...defaultSDKtArgs,
    },
  };

export default FloatingMetaMaskButtonMeta;

export const Disconnected: StoryObj<FloatingMetaMaskButtonProps & SDKState> = {
  args: {
    ...defaultSDKtArgs,
    connected: false,
  },
};

export const Connected: StoryObj<FloatingMetaMaskButtonProps & SDKState> = {
  args: {
    ...defaultSDKtArgs,
    connected: true,
  },
};
