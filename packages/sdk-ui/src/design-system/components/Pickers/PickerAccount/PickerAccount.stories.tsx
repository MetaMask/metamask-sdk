import React from 'react';
import PickerAccountComponent from './PickerAccount';
import { SAMPLE_PICKERACCOUNT_PROPS } from './PickerAccount.constants';
import { AvatarAccountType } from '../../Avatars/Avatar/variants/AvatarAccount';
import { Meta, Story } from '@storybook/react-native';
import { PickerAccountProps } from './PickerAccount.types';

export default {
  title: 'Component Library / Pickers / PickerAccount',
  component: PickerAccountComponent,
  argTypes: {
    accountAddress: {
      control: { type: 'text' },
      defaultValue: SAMPLE_PICKERACCOUNT_PROPS.accountAddress,
    },
    accountAvatarType: {
      options: Object.values(AvatarAccountType),
      control: { type: 'select' },
      defaultValue: SAMPLE_PICKERACCOUNT_PROPS.accountAvatarType,
    },
    accountName: {
      control: { type: 'text' },
      defaultValue: SAMPLE_PICKERACCOUNT_PROPS.accountName,
    },
    showAddress: {
      control: { type: 'boolean' },
      defaultValue: SAMPLE_PICKERACCOUNT_PROPS.showAddress,
    },
    // Add other argTypes if necessary
  },
} as Meta<PickerAccountProps>;

const Template: Story<PickerAccountProps> = (args) => (
  <PickerAccountComponent {...args} />
);

export const PickerAccount = Template.bind({});
PickerAccount.args = SAMPLE_PICKERACCOUNT_PROPS;
