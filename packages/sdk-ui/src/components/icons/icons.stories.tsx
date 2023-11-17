import React from 'react';
import { IconOriginal } from './IconOriginal';
import { IconSimplified } from './IconsSimplified';
import { IconWrongNetwork } from './IconWrongNetwork';
import { View } from 'react-native';
import { Meta } from '@storybook/react-native';

const Icons = () => {
  return (
    <View>
      <IconOriginal />
      <IconSimplified />
      <IconWrongNetwork />
    </View>
  );
};

const IconsMeta: Meta<typeof Icons> = {
  component: Icons,
};

export default IconsMeta;

export const Primary = () => <Icons />;
