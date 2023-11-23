import type { Meta } from '@storybook/react-native';
import React from 'react';
import { ItemView, ItemViewProps } from './item-view';

const ItemViewMeta: Meta<ItemViewProps> = {
  component: ItemView,
  title: 'SDK UI / Item View',
  argTypes: {},
  args: {
    label: 'Item Label',
    value: 'Value to display',
    processing: false,
  },
  decorators: [],
  parameters: {},
};

export default ItemViewMeta;

export const Primary = {
  args: {},
  component: (args: ItemViewProps) => <ItemView {...args} />,
};
