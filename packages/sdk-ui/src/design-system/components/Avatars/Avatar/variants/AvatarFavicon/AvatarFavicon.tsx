// Third party dependencies.
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  ImageErrorEventData,
  ImageSourcePropType,
  NativeSyntheticEvent,
} from 'react-native';
import RNSVG from 'react-native-svg';

// External dependencies.
import AvatarBase from '../../foundation/AvatarBase';
import { AvatarSize } from '../../Avatar.types';
import { useStyles } from '../../../../../hooks';
import Icon, { IconName } from '../../../../Icons/Icon';

// Internal dependencies.
import { AvatarFaviconProps } from './AvatarFavicon.types';
import {
  ICON_SIZE_BY_AVATAR_SIZE,
  FAVICON_AVATAR_IMAGE_ID,
} from './AvatarFavicon.constants';
import stylesheet from './AvatarFavicon.styles';
import { isNumber } from 'lodash';

/**
 * Returns the favicon URL from the image source if it is an SVG image
 * @param imageSource the image source
 */
export const isFaviconSVG = (imageSource: ImageSourcePropType) => {
  if (
    imageSource &&
    !isNumber(imageSource) &&
    'uri' in imageSource &&
    (imageSource.uri?.endsWith('.svg') ||
      imageSource.uri?.startsWith('data:image/svg+xml'))
  ) {
    return imageSource.uri;
  }
};

const AvatarFavicon = ({
  imageSource,
  size = AvatarSize.Md,
  style,
}: AvatarFaviconProps) => {
  const [error, setError] = useState<any>(undefined);
  const { styles } = useStyles(stylesheet, { style, error });

  const onError = useCallback(
    (e: NativeSyntheticEvent<ImageErrorEventData>) =>
      setError(e.nativeEvent.error),
    [setError],
  );

  const onSvgError = useCallback((e: any) => setError(e), [setError]);

  // TODO add the fallback with uppercase letter initial
  //  requires that the domain is passed in as a prop from the parent
  const renderFallbackFavicon = () => (
    <Icon size={ICON_SIZE_BY_AVATAR_SIZE[size]} name={IconName.Global} />
  );

  const svgSource = useMemo(() => {
    if (imageSource && !isNumber(imageSource) && 'uri' in imageSource) {
      return isFaviconSVG(imageSource);
    }
  }, [imageSource]);

  const renderSvg = () => {
    if (svgSource) {
      if ('SvgUri' in RNSVG) {
        const SvgUri = RNSVG.SvgUri as any;
        return (
          <SvgUri
            testID={FAVICON_AVATAR_IMAGE_ID}
            width="100%"
            height="100%"
            uri={svgSource}
            style={styles.image}
            onError={onSvgError}
          />
        );
      }
    }
    return null;
  };

  const renderImage = () => (
    <Image
      testID={FAVICON_AVATAR_IMAGE_ID}
      source={imageSource}
      style={styles.image}
      resizeMode={'contain'}
      onError={onError}
    />
  );

  const renderFavicon = () => (svgSource ? renderSvg() : renderImage());

  return (
    <AvatarBase size={size} style={styles.base}>
      {error ? renderFallbackFavicon() : renderFavicon()}
    </AvatarBase>
  );
};

export default AvatarFavicon;
