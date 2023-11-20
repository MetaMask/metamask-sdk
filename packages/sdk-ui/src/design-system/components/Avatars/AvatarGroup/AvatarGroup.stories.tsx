import React from 'react';
import AvatarGroup from './AvatarGroup';
import { AVAILABLE_TOKEN_LIST } from './AvatarGroup.constants';
import { Meta, Story } from '@storybook/react-native';
import { AvatarGroupProps } from './AvatarGroup.types';

export default {
  title: 'Component Library / Avatars / AvatarGroup',
  component: AvatarGroup,
} as Meta;

const Template: Story<AvatarGroupProps> = (args) => <AvatarGroup {...args} />;

export const Default = Template.bind({});
Default.args = {
  tokenList: AVAILABLE_TOKEN_LIST.slice(0, 3), // Default value
};

Default.argTypes = {};
