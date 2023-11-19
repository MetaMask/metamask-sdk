import React from 'react';
import HeaderBaseComponent from './HeaderBase';
import Button, { ButtonVariants } from '../Buttons/Button';
import ButtonIcon, { ButtonIconVariants } from '../Buttons/ButtonIcon';
import { IconName } from '../Icons/Icon';
import { Meta, Story } from '@storybook/react-native';

export default {
  title: 'Component Library / HeaderBase',
  component: HeaderBaseComponent,
} as Meta<typeof HeaderBaseComponent>;

const Template: Story<typeof HeaderBaseComponent> = () => (
  <HeaderBaseComponent
    startAccessory={
      <ButtonIcon
        variant={ButtonIconVariants.Secondary}
        iconName={IconName.ArrowLeft}
        onPress={() => {
          console.log('clicked');
        }}
      />
    }
    endAccessory={
      <Button
        variant={ButtonVariants.Primary}
        label="Cancel"
        onPress={() => {
          console.log('clicked');
        }}
      />
    }
  >
    Super Long HeaderBase Title that may span 3 lines
  </HeaderBaseComponent>
);

export const HeaderBase = Template.bind({});
