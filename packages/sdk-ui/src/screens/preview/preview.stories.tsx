import type { Meta } from '@storybook/react-native';
import React from 'react';
import { PreviewScreen } from './preview';

const PreviewScreenMeta: Meta<typeof PreviewScreen> = {
  component: PreviewScreen,
  argTypes: {},
  args: {},
};

export default PreviewScreenMeta;

export const Primary = () => <PreviewScreen />;
