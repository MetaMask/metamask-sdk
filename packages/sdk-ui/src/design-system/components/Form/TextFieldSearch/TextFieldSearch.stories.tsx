import React from 'react';
import TextFieldSearchComponent from './TextFieldSearch';
import { SAMPLE_TEXTFIELDSEARCH_PROPS } from './TextFieldSearch.constants';
import { TextFieldSize } from '../TextField/TextField.types';
import { Meta, Story } from '@storybook/react-native';
import { TextFieldSearchProps } from './TextFieldSearch.types';

export default {
  title: 'Component Library / Form / TextFieldSearch',
  component: TextFieldSearchComponent,
  argTypes: {
    size: {
      options: Object.values(TextFieldSize),
      control: { type: 'select' },
      defaultValue: SAMPLE_TEXTFIELDSEARCH_PROPS.size,
    },
    isError: {
      control: { type: 'boolean' },
      defaultValue: SAMPLE_TEXTFIELDSEARCH_PROPS.isError,
    },
    isDisabled: {
      control: { type: 'boolean' },
      defaultValue: SAMPLE_TEXTFIELDSEARCH_PROPS.isDisabled,
    },
    isReadonly: {
      control: { type: 'boolean' },
      defaultValue: SAMPLE_TEXTFIELDSEARCH_PROPS.isReadonly,
    },
    placeholder: {
      control: { type: 'text' },
      defaultValue: SAMPLE_TEXTFIELDSEARCH_PROPS.placeholder,
    },
    showClearButton: {
      control: { type: 'boolean' },
      defaultValue: SAMPLE_TEXTFIELDSEARCH_PROPS.showClearButton,
    },
    // Add other argTypes if necessary
  },
} as Meta<TextFieldSearchProps>;

const Template: Story<TextFieldSearchProps> = (args) => (
  <TextFieldSearchComponent {...args} />
);

export const TextFieldSearch = Template.bind({});
TextFieldSearch.args = SAMPLE_TEXTFIELDSEARCH_PROPS;
