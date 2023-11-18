import React from 'react';
import { Meta } from '@storybook/react-native';
import { IconsPreview, IconsPreviewProps } from './icons-preview';

const IconsPreviewMeta: Meta<IconsPreviewProps> = {
  component: IconsPreview,
};

export default IconsPreviewMeta;

export const Primary = () => <IconsPreview />;
