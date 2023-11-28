import { Meta } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { mockTheme } from '../../../../theme';
import Text, { TextVariant } from '../../Texts/Text';
import Badge from '../Badge/Badge';
import { BadgeProps, BadgeVariant } from '../Badge/Badge.types';
import { SAMPLE_BADGENETWORK_PROPS } from '../Badge/variants/BadgeNetwork/BadgeNetwork.constants';
import BadgeWrapper from './BadgeWrapper';
import {
  BadgeAnchorElementShape,
  BadgePosition,
  BadgeWrapperProps,
} from './BadgeWrapper.types';
import Avatar from '../../Avatars/Avatar';
import AvatarAccount from '../../Avatars/Avatar/variants/AvatarAccount';
import Icon from '../../Icons/Icon';

export default {
  title: 'Component Library/Badges/BadgeWrapper',
  component: BadgeWrapper,
  args: {
    anchorElementShape: BadgeAnchorElementShape.Circular,
    badgePosition: BadgePosition.TopRight,
    badge: 'network-initial',
  },
} as Meta<BadgeWrapperProps>;

export const Default = (args: BadgeWrapperProps) => {
  const badgeProps: BadgeProps = {
    variant: BadgeVariant.Network,
    name: SAMPLE_BADGENETWORK_PROPS.name,
  };

  const BadgeElement = <Badge {...badgeProps} />;

  return (
    <View style={{ margin: 10 }}>
      <BadgeWrapper
        anchorElementShape={args.anchorElementShape}
        badgePosition={args.badgePosition}
        badgeElement={BadgeElement}
      >
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            borderRadius:
              args.anchorElementShape === BadgeAnchorElementShape.Circular
                ? 12
                : 2,
            backgroundColor: mockTheme.colors.background.default,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant={TextVariant.BodySM}>{'Some component'}</Text>
        </View>
      </BadgeWrapper>
    </View>
  );
};

export const WrapAccount = (args: BadgeWrapperProps) => {
  const badgeProps: BadgeProps = {
    variant: BadgeVariant.Network,
    name: SAMPLE_BADGENETWORK_PROPS.name,
  };

  const BadgeElement = (
    <Badge
      {...badgeProps}
      variant={BadgeVariant.Network}
      name="Ethereum"
      imageSource={{
        uri: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
      }}
    />
  );

  return (
    <View style={{ margin: 10 }}>
      <BadgeWrapper
        anchorElementShape={args.anchorElementShape}
        badgePosition={args.badgePosition}
        badgeElement={BadgeElement}
      >
        <AvatarAccount accountAddress="0x123455" />
      </BadgeWrapper>
    </View>
  );
};
