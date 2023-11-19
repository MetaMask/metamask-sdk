import React from 'react';
import ButtonSecondary from './ButtonSecondary';
import { ButtonSecondaryProps } from './ButtonSecondary.types';
import { Meta, Story } from '@storybook/react-native';
import { SAMPLE_BUTTONBASE_PROPS } from '../../foundation/ButtonBase/ButtonBase.constants';

export default {
  title: 'Component Library / Buttons / ButtonSecondary',
  component: ButtonSecondary,
  argTypes: {
    // Define any specific props for ButtonSecondary if needed
    // You can also reuse argTypes from ButtonBase as needed
  },
} as Meta<ButtonSecondaryProps>;

const Template: Story<ButtonSecondaryProps> = (args) => (
  <ButtonSecondary {...args} />
);

export const Default = Template.bind({});
Default.args = {
  ...SAMPLE_BUTTONBASE_PROPS,
  // Override or add any additional args specific to ButtonSecondary here
};
