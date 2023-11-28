import { SDKState } from '@metamask/sdk-react';
import type { Meta } from '@storybook/react-native';
import React from 'react';
import {
  SdkContextDecorator,
  sdkProviderArgTypes,
} from '../../mocks/storybook.mocks';
import { SDKDebugPanel, SDKDebugPanelProps } from './sdk-debug-panel';

const SDKStatusMeta: Meta<SDKDebugPanelProps & SDKState> = {
  component: SDKDebugPanel,
  title: 'SDK UI / SDK Debug Panel',
  argTypes: {
    ...sdkProviderArgTypes,
  },
  args: {},
  decorators: [SdkContextDecorator],
  parameters: {},
};

export default SDKStatusMeta;

export const Primary = {
  args: {},
  component: (args: SDKDebugPanelProps) => <SDKDebugPanel {...args} />,
};
