import React from 'react';
import ButtonBase from './ButtonBase';
import { ButtonBaseProps } from './ButtonBase.types';
import { ButtonSize, ButtonWidthTypes } from '../../Button.types';
import { IconName } from '../../../../Icons/Icon';
import { Meta, Story } from '@storybook/react-native';
import {
  DEFAULT_BUTTONBASE_SIZE,
  DEFAULT_BUTTONBASE_WIDTH,
  SAMPLE_BUTTONBASE_PROPS,
} from './ButtonBase.constants';

export default {
  title: 'Component Library / Buttons / Button / ButtonBase',
  component: ButtonBase,
  argTypes: {
    size: {
      control: { type: 'select', options: Object.values(ButtonSize) },
      defaultValue: DEFAULT_BUTTONBASE_SIZE,
    },
    width: {
      control: { type: 'select', options: Object.values(ButtonWidthTypes) },
      defaultValue: DEFAULT_BUTTONBASE_WIDTH,
    },
    label: { control: 'text', defaultValue: SAMPLE_BUTTONBASE_PROPS.label },
    isDanger: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    startIconName: {
      control: { type: 'select', options: Object.values(IconName) },
    },
    endIconName: {
      control: { type: 'select', options: Object.values(IconName) },
    },
    // Additional props can be defined here
  },
} as Meta<ButtonBaseProps>;

const Template: Story<ButtonBaseProps> = (args) => <ButtonBase {...args} />;

export const Default = Template.bind({});
Default.args = {
  ...SAMPLE_BUTTONBASE_PROPS,
  onPress: () => console.log("I'm clicked!"),
  // Override or add any additional args here
};
