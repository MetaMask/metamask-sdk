import { SDKState } from '@metamask/sdk-react';
import type { Meta } from '@storybook/react-native';
import React from 'react';
import {
  SdkContextDecorator,
  sdkProviderArgTypes,
} from '../../mocks/storybook.mocks';
import {
  KeyExchangeStatus,
  KeyExchangeStatusProps,
} from './keyexchange-status';

const SDKStatusMeta: Meta<KeyExchangeStatusProps & SDKState> = {
  component: KeyExchangeStatus,
  title: 'SDK UI / KeyExchange Status',
  argTypes: {
    ...sdkProviderArgTypes,
  },
  args: {
    connected: true,
  },
  decorators: [SdkContextDecorator],
  parameters: {},
};

export default SDKStatusMeta;

export const Primary = {
  args: {},
  component: (args: KeyExchangeStatusProps) => <KeyExchangeStatus {...args} />,
};
