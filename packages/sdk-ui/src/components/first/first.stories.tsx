import type { Meta } from '@storybook/react-native';
import React from 'react';
import { First } from './first';

const FirstMeta: Meta<typeof First> = {
  component: First,
  argTypes: {},
  args: {},
};

export default FirstMeta;

export const Primary = () => <First />;
