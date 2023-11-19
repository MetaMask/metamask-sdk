import React from 'react';
import Banner from './Banner';
import { BannerProps, BannerVariant } from './Banner.types';
import { DEFAULT_BANNER_VARIANT } from './Banner.constants';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library / Banners',
  component: Banner,
  argTypes: {
    variant: {
      control: { type: 'select', options: BannerVariant },
      defaultValue: DEFAULT_BANNER_VARIANT,
    },
    // Add other argTypes if necessary
  },
} as Meta<BannerProps>;

const Template: Story<BannerProps> = (args) => <Banner {...args} />;

export const AlertBanner = Template.bind({});
AlertBanner.args = {
  variant: BannerVariant.Alert,
  // Add other args specific to AlertBanner
};

export const TipBanner = Template.bind({});
TipBanner.args = {
  variant: BannerVariant.Tip,
};

// Include other variants as needed
