import React from 'react';
import BannerTip from './BannerTip';
import { BannerTipProps, BannerTipLogoType } from './BannerTip.types';
import {
  DEFAULT_BANNERTIP_LOGOTYPE,
  SAMPLE_BANNERTIP_TITLE,
  SAMPLE_BANNERTIP_DESCRIPTION,
  SAMPLE_BANNERTIP_PROPS,
} from './BannerTip.constants';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library/Banners/BannerTip',
  component: BannerTip,
  argTypes: {
    logoType: {
      control: { type: 'select', options: BannerTipLogoType },
      defaultValue: DEFAULT_BANNERTIP_LOGOTYPE,
    },
    title: { control: 'text', defaultValue: SAMPLE_BANNERTIP_TITLE },
    description: {
      control: 'text',
      defaultValue: SAMPLE_BANNERTIP_DESCRIPTION,
    },
    // Define other props here
  },
} as Meta<BannerTipProps>;

const Template: Story<BannerTipProps> = (args) => <BannerTip {...args} />;

export const Default = Template.bind({});
Default.args = {
  actionButtonProps: SAMPLE_BANNERTIP_PROPS.actionButtonProps,
  onClose: SAMPLE_BANNERTIP_PROPS.onClose,
};
