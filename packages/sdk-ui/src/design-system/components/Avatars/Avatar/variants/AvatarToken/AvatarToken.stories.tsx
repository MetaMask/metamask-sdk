// Third party dependencies.
import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { boolean, select, text } from '@storybook/addon-knobs';

// External dependencies.
import { storybookPropsGroupID } from '../../../../../../constants/storybook.constants';
import { AvatarSize, AvatarVariant } from '../../Avatar.types';

// Internal dependencies.
import AvatarToken from './AvatarToken';
import {
  TEST_REMOTE_TOKEN_IMAGES,
  TEST_TOKEN_NAME,
} from './AvatarToken.constants';
import { AvatarTokenProps } from './AvatarToken.types';
import { TEST_LOCAL_IMAGE_SOURCE } from '../AvatarFavicon/AvatarFavicon.constants';

export const getAvatarTokenStoryProps = (): AvatarTokenProps => {
  const sizeSelector = select(
    'size',
    AvatarSize,
    AvatarSize.Md,
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

  let image: ImageSourcePropType;

  if (imgSourceSelector === imgSourceOptions.Local) {
    image = TEST_LOCAL_IMAGE_SOURCE;
  } else {
    const imageUrlSelector = select(
      'imageSource.uri',
      TEST_REMOTE_TOKEN_IMAGES,
      TEST_REMOTE_TOKEN_IMAGES[0],
      storybookPropsGroupID,
    );
    image = {
      uri: imageUrlSelector,
    };
  }
  const tokenNameSelector = text(
    'name',
    TEST_TOKEN_NAME,
    storybookPropsGroupID,
  );

  const isHaloEnabled = boolean('isHaloEnabled', false, storybookPropsGroupID);

  const args: AvatarTokenProps = {
    size: sizeSelector,
    name: tokenNameSelector,
    imageSource: image,
    isHaloEnabled,
    style: { backgroundColor: 'red' },
    variant: AvatarVariant.Token,
  };
  return args;
};

const AvatarTokenStory = () => <AvatarToken {...getAvatarTokenStoryProps()} />;

export default AvatarTokenStory;
