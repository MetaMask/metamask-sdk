import React from 'react';
import ButtonPrimary from './ButtonPrimary';
import { ButtonPrimaryProps } from './ButtonPrimary.types';
import { Meta, Story } from '@storybook/react-native';
import { SAMPLE_BUTTONBASE_PROPS } from '../../foundation/ButtonBase/ButtonBase.constants';

export default {
  title: 'Component Library / Buttons / ButtonPrimary',
  component: ButtonPrimary,
  argTypes: {
    // Define any specific props for ButtonPrimary if needed
    // You can also reuse argTypes from ButtonBase as needed
  },
} as Meta<ButtonPrimaryProps>;

const Template: Story<ButtonPrimaryProps> = (args) => (
  <ButtonPrimary {...args} />
);

export const Default = Template.bind({});
Default.args = {
  ...SAMPLE_BUTTONBASE_PROPS,
  // Override or add any additional args specific to ButtonPrimary here
};
