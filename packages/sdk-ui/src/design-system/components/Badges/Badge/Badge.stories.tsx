import React from 'react';
import Badge from './Badge';

import { Meta } from '@storybook/react';
import { View } from 'react-native';
import { BadgeProps, BadgeVariant } from './Badge.types';
import BadgeNetwork from './variants/BadgeNetwork';
import { SAMPLE_BADGENETWORK_PROPS } from './variants/BadgeNetwork/BadgeNetwork.constants';
import BadgeStatus from './variants/BadgeStatus';
import { BadgeStatusState } from './variants/BadgeStatus/BadgeStatus.types';

export default {
  title: 'Component Library/Badges',
  component: Badge,
} as Meta<BadgeProps>;

export const Network = () => (
  <View
    // eslint-disable-next-line react-native/no-inline-styles
    style={{
      height: 50,
      width: 50,
    }}
  >
    <BadgeNetwork {...SAMPLE_BADGENETWORK_PROPS} />
  </View>
);

export const Status = () => (
  <View
    // eslint-disable-next-line react-native/no-inline-styles
    style={{
      height: 50,
      width: 50,
    }}
  >
    <BadgeStatus
      variant={BadgeVariant.Status}
      state={BadgeStatusState.Active}
    />
  </View>
);
