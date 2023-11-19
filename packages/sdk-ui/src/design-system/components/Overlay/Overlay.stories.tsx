import React from 'react';
import OverlayComponent from './Overlay';
import { mockTheme } from '../../../theme';
import { Meta, Story } from '@storybook/react-native';
import { OverlayProps } from './Overlay.types';

export default {
  title: 'Component Library / Overlay',
  component: OverlayComponent,
  argTypes: {
    color: {
      control: { type: 'color' },
      defaultValue: mockTheme.colors.overlay.default,
    },
  },
} as Meta<OverlayProps>;

const Template: Story<OverlayProps> = (args) => (
  <OverlayComponent {...args} onPress={() => console.log("I'm clicked!")} />
);

export const Overlay = Template.bind({});
Overlay.args = {
  color: mockTheme.colors.overlay.default,
};
