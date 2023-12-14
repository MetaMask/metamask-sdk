import { RPCMethodCache } from '@metamask/sdk-communication-layer';
import { SDKState } from '@metamask/sdk-react';
import type { Meta, StoryObj } from '@storybook/react-native';
import {
  SdkContextDecorator,
  sdkProviderArgTypes,
} from '../../mocks/storybook.mocks';
import { RPCHistoryViewer, RPCHistoryViewerProps } from './rpc-history-viewer';

const RPCHistoryViewerMeta: Meta<RPCHistoryViewerProps & SDKState> = {
  title: 'SDK UI / RPCHistoryViewer',
  component: RPCHistoryViewer,
  argTypes: {
    ...sdkProviderArgTypes,
  },
  decorators: [SdkContextDecorator],
  parameters: {},
};

export default RPCHistoryViewerMeta;

// Example RPC history data
const mockRpcHistory: RPCMethodCache = {
  '1': {
    id: '1',
    method: 'eth_blockNumber',
    timestamp: Date.now() - 10000,
    result: '0x5BAD55',
    error: undefined,
    elapsedTime: 27,
  },
  '2': {
    id: '2',
    method: 'eth_getBalance',
    timestamp: Date.now() - 5000,
    result: '0x1C8E8C6CG',
    error: undefined,
    elapsedTime: 34,
  },
  '3': {
    id: '3',
    method: 'eth_sendTransaction',
    timestamp: Date.now(),
    result: undefined,
    error: { message: 'User denied transaction signature.' },
    elapsedTime: 45,
  },
};

// You would need to mock the `useSDK` hook to return this data for the stories to work
export const WithHistoryData: StoryObj<RPCHistoryViewerProps & SDKState> = {
  args: {
    startVisible: true,
    rpcHistory: mockRpcHistory,
  },
};
