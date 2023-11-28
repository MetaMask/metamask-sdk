import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { HistoryItem, HistoryItemProps } from './history-item';
import { View } from 'react-native';

const defaultEntry: HistoryItemProps['entry'] = {
  id: '11111',
  method: 'eth_requestAccounts',
  timestamp: Date.now(),
  result: { accounts: ['0x123...', '0x456...'] },
  error: undefined,
  elapsedTime: 123,
};

const HistoryItemMeta: Meta<HistoryItemProps> = {
  title: 'SDK UI / RPCHistoryViewer / History Item',
  component: HistoryItem,
  args: {
    entry: { ...defaultEntry },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#050505' },
      ],
    },
  },
};

export default HistoryItemMeta;

export const Primary: StoryObj<HistoryItemProps> = {
  args: {},
};

export const WithResult: StoryObj<HistoryItemProps> = {
  args: {
    entry: {
      ...defaultEntry,
      result: { success: true, balance: '100 ETH' },
      error: undefined,
    },
  },
};

export const WithError: StoryObj<HistoryItemProps> = {
  args: {
    entry: {
      ...defaultEntry,
      result: undefined,
      error: { code: -32603, message: 'Internal error' },
    },
  },
};

export const LongElapsedTime: StoryObj<HistoryItemProps> = {
  args: {
    entry: {
      ...defaultEntry,
      elapsedTime: 9876,
    },
  },
};

export const NoElapsedTime: StoryObj<HistoryItemProps> = {
  args: {
    entry: {
      ...defaultEntry,
      elapsedTime: undefined,
    },
  },
};

// Add more variations if needed
