import React from 'react';
import ButtonIcon from './ButtonIcon';
import {
  ButtonIconProps,
  ButtonIconSizes,
  ButtonIconVariants,
} from './ButtonIcon.types';
import { IconName } from '../../Icons/Icon';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library / Buttons / ButtonIcon',
  component: ButtonIcon,
  argTypes: {
    size: {
      control: { type: 'select', options: Object.values(ButtonIconSizes) },
      defaultValue: ButtonIconSizes.Lg,
    },
    iconName: {
      control: { type: 'select', options: Object.values(IconName) },
      defaultValue: IconName.Lock,
    },
    variant: {
      control: { type: 'select', options: Object.values(ButtonIconVariants) },
      defaultValue: ButtonIconVariants.Primary,
    },
    isDisabled: { control: 'boolean' },
    // Other props can be added here if needed
  },
} as Meta<ButtonIconProps>;

const Template: Story<ButtonIconProps> = (args) => <ButtonIcon {...args} />;

export const Default = Template.bind({});
Default.args = {
  size: ButtonIconSizes.Lg,
  iconName: IconName.Lock,
  variant: ButtonIconVariants.Primary,
  isDisabled: false,
  onPress: () => console.log("I'm clicked!"),
};
