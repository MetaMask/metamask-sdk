// Third party dependencies.
import { select, text } from '@storybook/addon-knobs';
import React from 'react';

// External dependencies.
import { storybookPropsGroupID } from '../../../../../../constants/storybook.constants';
import { AvatarSize, AvatarVariant } from '../../Avatar.types';

// Internal dependencies.
import AvatarNetwork from './AvatarNetwork';
import {
  TEST_LOCAL_IMAGE_SOURCE,
  TEST_NETWORK_NAME,
  TEST_REMOTE_IMAGE_SOURCE,
} from './AvatarNetwork.constants';
import { AvatarNetworkProps } from './AvatarNetwork.types';

export const getAvatarNetworkStoryProps = (): AvatarNetworkProps => {
  const sizeSelector = select(
    'size',
    AvatarSize,
    AvatarSize.Md,
    storybookPropsGroupID,
  );
  const networkNameSelector = text(
    'name',
    TEST_NETWORK_NAME,
    storybookPropsGroupID,
  );

  const imgSourceOptions = {
    Remote: 'REMOTE',
    Local: 'LOCAL',
  };

  const imgSourceSelector = select(
    'imageSource.uri Source',
    imgSourceOptions,
    imgSourceOptions.Remote,
    storybookPropsGroupID,
  );

  const imgSrcToSrc = {
    [imgSourceOptions.Local]: TEST_LOCAL_IMAGE_SOURCE,
    [imgSourceOptions.Remote]: TEST_REMOTE_IMAGE_SOURCE,
  };
  return {
    size: sizeSelector,
    name: networkNameSelector,
    imageSource: imgSrcToSrc[imgSourceSelector],
    variant: AvatarVariant.Network,
  };
};
const AvatarNetworkStory = () => (
  <AvatarNetwork {...getAvatarNetworkStoryProps()} />
);

export default AvatarNetworkStory;
