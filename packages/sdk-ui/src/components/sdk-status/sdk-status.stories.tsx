import { SDKState } from '@metamask/sdk-react';
import type { Meta, StoryObj } from '@storybook/react-native';
import {
  SdkContextDecorator,
  sdkProviderArgTypes,
} from '../../mocks/storybook.mocks';
import { SDKStatus, SDKStatusProps } from './sdk-status';

const SDKStatusMeta: Meta<SDKStatusProps & SDKState> = {
  component: SDKStatus,
  title: 'SDK UI / SDK Status',
  argTypes: {
    ...sdkProviderArgTypes,
  },
  decorators: [SdkContextDecorator],
  parameters: {},
};

export default SDKStatusMeta;

export const Primary: StoryObj<SDKStatusProps & SDKState> = {
  args: {
    connected: true,
  },
};
