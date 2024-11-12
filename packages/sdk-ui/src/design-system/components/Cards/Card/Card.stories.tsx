import React from 'react';
import { View } from 'react-native';
import Text, { TextVariant } from '../../Texts/Text';
import CardComponent from './Card';
import { mockTheme } from '../../../../theme';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library / Cards',
  component: CardComponent,
} as Meta<typeof CardComponent>;

const Template: Story<typeof CardComponent> = () => (
  <CardComponent>
    <View
      style={{
        height: 50,
        backgroundColor: mockTheme.colors.background.alternative,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant={TextVariant.BodySM}>{'Wrapped Content'}</Text>
    </View>
  </CardComponent>
);

export const Card = Template.bind({});
