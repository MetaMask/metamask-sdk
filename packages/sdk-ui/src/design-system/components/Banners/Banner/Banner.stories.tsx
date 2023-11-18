// Third party dependencies.
import { select } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';

// External dependencies.
import { storybookPropsGroupID } from '../../../../constants/storybook.constants';
import BannerTipStory, {
  getBannerTipStoryProps,
} from './variants/BannerTip/BannerTip.stories';

// Internal dependencies.
import Banner from './Banner';
import { DEFAULT_BANNER_VARIANT } from './Banner.constants';
import { BannerProps, BannerVariant } from './Banner.types';

export const getBannerStoryProps = (): BannerProps => {
  let bannerProps: BannerProps;

  const bannerVariantsSelector = select(
    'variant',
    BannerVariant,
    DEFAULT_BANNER_VARIANT,
    storybookPropsGroupID,
  );
  switch (bannerVariantsSelector) {
    case BannerVariant.Alert:
      bannerProps = {
        variant: BannerVariant.Alert,
      };
      break;
    case BannerVariant.Tip:
      bannerProps = {
        variant: BannerVariant.Tip,
        ...getBannerTipStoryProps(),
      };
      break;
  }
  return bannerProps;
};
const BannerStory = () => <Banner {...getBannerStoryProps()} />;

storiesOf('Component Library / Banners', module)
  .add('Banner', BannerStory)
  .add('Variants / BannerTip', BannerTipStory);

export default BannerStory;
