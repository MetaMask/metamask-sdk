import React from 'react';
import CheckboxComponent from './Checkbox';
import { SAMPLE_CHECKBOX_PROPS } from './Checkbox.constants';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library / Checkbox',
  component: CheckboxComponent,
  argTypes: {
    isChecked: {
      control: { type: 'boolean' },
    },
    isIndeterminate: {
      control: { type: 'boolean' },
    },
    isDisabled: {
      control: { type: 'boolean' },
    },
    isReadOnly: {
      control: { type: 'boolean' },
    },
    isDanger: {
      control: { type: 'boolean' },
    },
    // Add other argTypes if necessary
  },
} as Meta<typeof CheckboxComponent>;

const Template: Story<typeof CheckboxComponent> = (args) => (
  <CheckboxComponent {...args} />
);

export const Checkbox = Template.bind({});
Checkbox.args = SAMPLE_CHECKBOX_PROPS;
