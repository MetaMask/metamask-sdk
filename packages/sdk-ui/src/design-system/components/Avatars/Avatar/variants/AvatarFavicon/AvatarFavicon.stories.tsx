import React from 'react';
import AvatarFavicon from './AvatarFavicon';
import { AvatarFaviconProps } from './AvatarFavicon.types';
import { AvatarSize, AvatarVariant } from '../../Avatar.types';
import {
  TEST_LOCAL_IMAGE_SOURCE,
  TEST_REMOTE_IMAGE_SOURCE,
} from './AvatarFavicon.constants';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library/Avatars/Avatar/AvatarFavicon',
  component: AvatarFavicon,
  argTypes: {
    size: {
      control: { type: 'select', options: Object.values(AvatarSize) },
      defaultValue: AvatarSize.Md,
    },
    imageSource: {
      control: {
        type: 'select',
        options: {
          Remote: TEST_REMOTE_IMAGE_SOURCE,
          Local: TEST_LOCAL_IMAGE_SOURCE,
        },
      },
      defaultValue: TEST_REMOTE_IMAGE_SOURCE,
    },
    variant: {
      control: { type: 'select', options: Object.values(AvatarVariant) },
      defaultValue: AvatarVariant.Favicon,
    },
  },
} as Meta<AvatarFaviconProps>;

const Template: Story<AvatarFaviconProps> = (args) => (
  <AvatarFavicon {...args} />
);

export const Default = Template.bind({});
Default.args = {
  size: AvatarSize.Md,
  imageSource: TEST_REMOTE_IMAGE_SOURCE,
  variant: AvatarVariant.Favicon,
};
