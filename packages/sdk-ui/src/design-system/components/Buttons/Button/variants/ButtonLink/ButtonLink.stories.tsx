import React from 'react';
import ButtonLink from './ButtonLink';
import { ButtonLinkProps } from './ButtonLink.types';
import { TextVariant } from '../../../../Texts/Text';
import { Meta, Story } from '@storybook/react-native';
import { SAMPLE_BUTTONBASE_PROPS } from '../../foundation/ButtonBase/ButtonBase.constants';

export default {
  title: 'Component Library / Buttons / ButtonLink',
  component: ButtonLink,
  argTypes: {
    textVariant: {
      control: { type: 'select', options: Object.values(TextVariant) },
      defaultValue: TextVariant.HeadingSMRegular,
    },
    // Include other properties from ButtonBase as needed
  },
} as Meta<ButtonLinkProps>;

const Template: Story<ButtonLinkProps> = (args) => <ButtonLink {...args} />;

export const Default = Template.bind({});
Default.args = {
  ...SAMPLE_BUTTONBASE_PROPS,
  // Override or add any additional args here
};
