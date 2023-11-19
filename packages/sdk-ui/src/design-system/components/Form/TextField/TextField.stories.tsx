import React from 'react';
import TextFieldComponent from './TextField';
import { SAMPLE_TEXTFIELD_PROPS } from './TextField.constants';
import { TextFieldProps, TextFieldSize } from './TextField.types';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library / Form / TextField',
  component: TextFieldComponent,
  argTypes: {
    size: {
      options: Object.values(TextFieldSize),
      control: { type: 'select' },
      defaultValue: SAMPLE_TEXTFIELD_PROPS.size,
    },
    isError: {
      control: { type: 'boolean' },
      defaultValue: SAMPLE_TEXTFIELD_PROPS.isError,
    },
    isDisabled: {
      control: { type: 'boolean' },
      defaultValue: SAMPLE_TEXTFIELD_PROPS.isDisabled,
    },
    isReadonly: {
      control: { type: 'boolean' },
      defaultValue: SAMPLE_TEXTFIELD_PROPS.isReadonly,
    },
    placeholder: {
      control: { type: 'text' },
      defaultValue: SAMPLE_TEXTFIELD_PROPS.placeholder,
    },
    // Add other argTypes if necessary
  },
} as Meta<TextFieldProps>;

const Template: Story<TextFieldProps> = (args) => (
  <TextFieldComponent
    {...args}
    startAccessory={SAMPLE_TEXTFIELD_PROPS.startAccessory}
    endAccessory={SAMPLE_TEXTFIELD_PROPS.endAccessory}
  />
);

export const TextField = Template.bind({});
TextField.args = {
  ...SAMPLE_TEXTFIELD_PROPS,
};
