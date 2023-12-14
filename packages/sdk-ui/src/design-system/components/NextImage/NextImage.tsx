import React from 'react';
import { ImageProps, Platform, Image as RNImage } from 'react-native';

// Type guard to check if source is an object with a 'src' property
function isWebImageSource(source: any): source is { src: string } {
  return source && typeof source === 'object' && 'src' in source;
}

export const Image = (props: ImageProps) => {
  // Handle NextJs image source
  if (Platform.OS === 'web' && isWebImageSource(props.source)) {
    // Cast the source to any to bypass the type checking
    return <RNImage {...props} source={{ uri: (props.source as any).src }} />;
  }
  return <RNImage {...props} />;
};
