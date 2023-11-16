import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';

export const IconWrongNetwork = () => {
  return (
    <View style={{ paddingTop: 2 }}>
      <Svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <Line x1="12" y1="9" x2="12" y2="13" />
        <Line x1="12" y1="17" x2="12.01" y2="17" />
      </Svg>
    </View>
  );
};
