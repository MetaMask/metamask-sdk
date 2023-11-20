import React from 'react';
import HelpTextComponent from './HelpText';
import { SAMPLE_HELPTEXT_PROPS } from './HelpText.constants';
import { HelpTextProps, HelpTextSeverity } from './HelpText.types';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library / Form / HelpText',
  component: HelpTextComponent,
  argTypes: {
    severity: {
      options: Object.values(HelpTextSeverity),
      control: { type: 'select' },
      defaultValue: SAMPLE_HELPTEXT_PROPS.severity,
    },
    children: {
      control: { type: 'text' },
      defaultValue: SAMPLE_HELPTEXT_PROPS.children,
    },
  },
} as Meta<HelpTextProps>;

const Template: Story<HelpTextProps> = (args) => (
  <HelpTextComponent {...args} />
);

export const HelpText = Template.bind({});
HelpText.args = SAMPLE_HELPTEXT_PROPS;
