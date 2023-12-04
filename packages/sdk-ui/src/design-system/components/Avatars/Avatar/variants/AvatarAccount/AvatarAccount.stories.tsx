import React from 'react';
import AvatarAccount from './AvatarAccount';
import { AvatarAccountProps, AvatarAccountType } from './AvatarAccount.types';
import { AvatarSize, AvatarVariant } from '../../Avatar.types';
import { DUMMY_WALLET_ADDRESS } from './AvatarAccount.constants';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library/Avatars/Avatar/AvatarAccount',
  component: AvatarAccount,
  argTypes: {
    accountAddress: { control: 'text', defaultValue: DUMMY_WALLET_ADDRESS },
    size: {
      control: { type: 'select', options: AvatarSize },
      defaultValue: AvatarSize.Md,
    },
    type: {
      control: { type: 'select', options: AvatarAccountType },
      defaultValue: AvatarAccountType.JazzIcon,
    },
    variant: {
      control: { type: 'select', options: AvatarVariant },
      defaultValue: AvatarVariant.Account,
    },
  },
} as Meta;

const Template: Story<AvatarAccountProps> = (args) => (
  <AvatarAccount {...args} />
);

export const Default = Template.bind({});
Default.args = {
  accountAddress: DUMMY_WALLET_ADDRESS,
  size: AvatarSize.Md,
  type: AvatarAccountType.JazzIcon,
  variant: AvatarVariant.Account,
};
