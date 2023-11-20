import React from 'react';

// External dependencies.
import { TextColor, TextVariant } from '../Text';

// Internal dependencies.
import { Meta } from '@storybook/react-native';
import { IconColor, IconName, IconSize } from '../../Icons/Icon';
import { default as TextWithPrefixIconComponent } from './TextWithPrefixIcon';
import { SAMPLE_TEXTWITHPREFIXICON_PROPS } from './TextWithPrefixIcon.constants';

const TextWithPrefixIconMeta: Meta = {
  title: 'Component Library / Texts',
  component: TextWithPrefixIconComponent,
  argTypes: {
    variant: {
      options: TextVariant,
      control: {
        type: 'select',
      },
      defaultValue: SAMPLE_TEXTWITHPREFIXICON_PROPS.variant,
    },
    children: {
      control: { type: 'text' },
      defaultValue: SAMPLE_TEXTWITHPREFIXICON_PROPS.children,
    },
    color: {
      options: TextColor,
      control: {
        type: 'select',
      },
      defaultValue: SAMPLE_TEXTWITHPREFIXICON_PROPS.color,
    },
    iconProps: {
      control: { type: 'object' },
      defaultValue: SAMPLE_TEXTWITHPREFIXICON_PROPS.iconProps,
    },
    iconSize: {
      options: IconSize,
      control: {
        type: 'select',
      },
      defaultValue: SAMPLE_TEXTWITHPREFIXICON_PROPS.iconProps.size,
    },
    iconName: {
      options: IconName,
      control: {
        type: 'select',
      },
      defaultValue: SAMPLE_TEXTWITHPREFIXICON_PROPS.iconProps.name,
    },
    iconColor: {
      options: IconColor,
      control: {
        type: 'select',
      },
      defaultValue: SAMPLE_TEXTWITHPREFIXICON_PROPS.iconProps.color,
    },
  },
  args: {
    children: 'here is a sample text',
    iconProps: {
      name: IconName.Add,
    },
  },
};
export default TextWithPrefixIconMeta;

export const TextWithPrefixIcon = (args: any) => {
  const { iconSize, iconName, iconColor } = args;
  console.log(`change params`, args);
  return (
    <TextWithPrefixIconComponent
      {...args}
      iconProps={{ size: iconSize, name: iconName, color: iconColor }}
    />
  );
};
