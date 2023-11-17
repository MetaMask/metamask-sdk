import type { Meta } from '@storybook/react-native';
import React from 'react';
import { SDKSummary, SDKSummaryProps } from './sdk-summary';
import { SDKState } from '@metamask/sdk-react';

const mockState = {
  sdk: {
    terminate: () => {},
  }, // Mock the MetaMaskSDK
  ready: true, // Assuming the SDK is ready in the mock
  connected: true, // Mock as connected
  connecting: false, // Mock as not currently connecting
  extensionActive: true, // Mock extension as active
  readOnlyCalls: true, // Mock as able to make read-only calls
  provider: {}, // Mock the provider
  error: undefined, // Mock no error
  chainId: '0x1', // Mock a chain ID
  balance: '0x0', // Mock balance as 0 wei
  account: '0xMockedAccount', // Mock an account address
  status: {}, // Mock service status
  rpcHistory: {}, // Mock RPC method cache
} as SDKState;

const SDKSummaryMeta: Meta<SDKSummaryProps> = {
  component: SDKSummary,
  argTypes: {},
  args: {
    _sdkState: mockState,
  },
  parameters: {
    deepControls: { enabled: true },
  },
};

export default SDKSummaryMeta;

export const Primary = (args: SDKSummaryProps) => <SDKSummary {...args} />;
