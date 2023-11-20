import React from 'react';
import AvatarIcon from './AvatarIcon';
import { AvatarIconProps } from './AvatarIcon.types';
import { AvatarSize, AvatarVariant } from '../../Avatar.types';
import { IconName } from '../../../../Icons/Icon';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library/Avatars/Avatar/AvatarIcon',
  component: AvatarIcon,
  argTypes: {
    size: {
      control: { type: 'select', options: Object.values(AvatarSize) },
      defaultValue: AvatarSize.Md,
    },
    name: {
      control: { type: 'select', options: Object.values(IconName) },
      defaultValue: IconName.Lock,
    },
    variant: {
      control: { type: 'select', options: Object.values(AvatarVariant) },
      defaultValue: AvatarVariant.Icon,
    },
  },
} as Meta<AvatarIconProps>;

const Template: Story<AvatarIconProps> = (args) => <AvatarIcon {...args} />;

export const Default = Template.bind({});
Default.args = {
  size: AvatarSize.Md,
  name: IconName.Lock,
  variant: AvatarVariant.Icon,
};
