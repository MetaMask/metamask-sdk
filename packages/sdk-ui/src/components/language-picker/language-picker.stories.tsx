import type { Meta } from '@storybook/react-native';
import React from 'react';
import { LanguagePicker } from './language-picker';

const LanguagePickerMeta: Meta = {
  component: LanguagePicker,
  title: 'SDK UI / Language Picker',
  argTypes: {},
  decorators: [],
  parameters: {},
};

export default LanguagePickerMeta;

export const Primary = {
  args: {},
  component: () => <LanguagePicker />,
};
