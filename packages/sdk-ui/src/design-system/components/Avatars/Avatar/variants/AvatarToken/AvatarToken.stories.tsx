import React from 'react';
import AvatarToken from './AvatarToken';
import { AvatarTokenProps } from './AvatarToken.types';
import { AvatarSize, AvatarVariant } from '../../Avatar.types';
import { Meta, Story } from '@storybook/react-native';
import {
  TEST_REMOTE_TOKEN_IMAGES,
  TEST_TOKEN_NAME,
} from './AvatarToken.constants';
import { TEST_LOCAL_IMAGE_SOURCE } from '../AvatarFavicon/AvatarFavicon.constants';

export default {
  title: 'Component Library/Avatars/Avatar/AvatarToken',
  component: AvatarToken,
  argTypes: {
    size: {
      control: { type: 'select', options: Object.values(AvatarSize) },
      defaultValue: AvatarSize.Md,
    },
    imageSource: {
      control: {
        type: 'select',
        options: {
          Remote: TEST_REMOTE_TOKEN_IMAGES[0],
          Local: TEST_LOCAL_IMAGE_SOURCE,
        },
      },
    },
    name: { control: 'text', defaultValue: TEST_TOKEN_NAME },
    isHaloEnabled: { control: 'boolean' },
    variant: {
      control: { type: 'select', options: Object.values(AvatarVariant) },
      defaultValue: AvatarVariant.Favicon,
    }, // Additional props can be defined here
  },
} as Meta<AvatarTokenProps>;

const Template: Story<AvatarTokenProps> = (args) => <AvatarToken {...args} />;

export const Default = Template.bind({});
Default.args = {
  size: AvatarSize.Md,
  imageSource: { uri: TEST_REMOTE_TOKEN_IMAGES[0] }, // Default to the first image URL
  name: TEST_TOKEN_NAME,
  isHaloEnabled: false,
  variant: AvatarVariant.Token,
};
