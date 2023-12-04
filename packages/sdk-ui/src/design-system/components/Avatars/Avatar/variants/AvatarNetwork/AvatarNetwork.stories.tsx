import React from 'react';
import AvatarNetwork from './AvatarNetwork';
import { AvatarNetworkProps } from './AvatarNetwork.types';
import { AvatarSize, AvatarVariant } from '../../Avatar.types';
import { Meta, Story } from '@storybook/react-native';
import {
  TEST_NETWORK_NAME,
  TEST_REMOTE_IMAGE_SOURCE,
} from './AvatarNetwork.constants';
import { TEST_LOCAL_IMAGE_SOURCE } from '../AvatarFavicon/AvatarFavicon.constants';

export default {
  title: 'Component Library/Avatars/Avatar/AvatarNetwork',
  component: AvatarNetwork,
  argTypes: {
    size: {
      control: { type: 'select', options: Object.values(AvatarSize) },
      defaultValue: AvatarSize.Md,
    },
    name: { control: 'text', defaultValue: TEST_NETWORK_NAME },
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
      defaultValue: AvatarVariant.Network,
    },
  },
} as Meta<AvatarNetworkProps>;

const Template: Story<AvatarNetworkProps> = (args) => (
  <AvatarNetwork {...args} />
);

export const Default = Template.bind({});
Default.args = {
  size: AvatarSize.Md,
  name: TEST_NETWORK_NAME,
  imageSource: TEST_REMOTE_IMAGE_SOURCE,
  variant: AvatarVariant.Network,
};
