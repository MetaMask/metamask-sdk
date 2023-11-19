import React from 'react';
import LabelComponent from './Label';
import { SAMPLE_LABEL_TEXT } from './Label.constants';
import { Meta, Story } from '@storybook/react-native';
import { LabelProps } from './Label.types';

export default {
  title: 'Component Library / Form / Label',
  component: LabelComponent,
  argTypes: {
    children: {
      control: { type: 'text' },
      defaultValue: SAMPLE_LABEL_TEXT,
    },
  },
} as Meta<LabelProps>;

const Template: Story<LabelProps> = (args) => <LabelComponent {...args} />;

export const Label = Template.bind({});
Label.args = {
  children: SAMPLE_LABEL_TEXT,
};
