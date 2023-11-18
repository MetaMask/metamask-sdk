import React from 'react';
import Avatar from './Avatar';
import { AvatarProps, AvatarVariant } from './Avatar.types';
import AvatarAccountStory, {
  getAvatarAccountStoryProps,
} from './variants/AvatarAccount/AvatarAccount.stories';
import AvatarFaviconStory, {
  getAvatarFaviconStoryProps,
} from './variants/AvatarFavicon/AvatarFavicon.stories';
import AvatarIconStory, {
  getAvatarIconStoryProps,
} from './variants/AvatarIcon/AvatarIcon.stories';
import AvatarNetworkStory, {
  getAvatarNetworkStoryProps,
} from './variants/AvatarNetwork/AvatarNetwork.stories';
import AvatarTokenStory, {
  getAvatarTokenStoryProps,
} from './variants/AvatarToken/AvatarToken.stories';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library/Avatars',
  component: Avatar,
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: Object.values(AvatarVariant),
      },
      defaultValue: AvatarVariant.Account,
    },
  },
} as Meta<AvatarProps>;

const Template: Story<AvatarProps> = (args) => <Avatar {...args} />;

export const AvatarAccount = Template.bind({});
AvatarAccount.args = getAvatarAccountStoryProps();

export const AvatarFavicon = Template.bind({});
AvatarFavicon.args = getAvatarFaviconStoryProps();

export const AvatarIcon = Template.bind({});
AvatarIcon.args = getAvatarIconStoryProps();

export const AvatarNetwork = Template.bind({});
AvatarNetwork.args = getAvatarNetworkStoryProps();

export const AvatarToken = Template.bind({});
AvatarToken.args = getAvatarTokenStoryProps();
