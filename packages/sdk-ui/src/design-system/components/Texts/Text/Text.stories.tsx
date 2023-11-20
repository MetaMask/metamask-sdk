// Internal dependencies.
import { default as TextComponent } from './Text';
import { TextProps } from './Text.types';
import { SAMPLE_TEXT_PROPS } from './Text.constants';
import { TextVariant, TextColor } from './Text.types';
import { Meta } from '@storybook/react-native';

const TextMeta: Meta<TextProps> = {
  title: 'Component Library / Texts',
  component: TextComponent,
  argTypes: {
    variant: {
      options: TextVariant,
      control: {
        type: 'select',
      },
      defaultValue: SAMPLE_TEXT_PROPS.variant,
    },
    children: {
      control: { type: 'text' },
      defaultValue: SAMPLE_TEXT_PROPS.children,
    },
    color: {
      options: TextColor,
      control: {
        type: 'select',
      },
      defaultValue: SAMPLE_TEXT_PROPS.color,
    },
  },
  args: {
    children: 'here is a sample text',
  },
};
export default TextMeta;

export const Text = {};
