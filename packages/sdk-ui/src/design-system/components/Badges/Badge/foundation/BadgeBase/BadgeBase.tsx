// Third library dependencies.
import React from 'react';
import { View } from 'react-native';

// External dependencies.
import { useStyles } from '../../../../../hooks';

// Internal dependencies
import { BADGE_BASE_TEST_ID } from './BadgeBase.constants';
import { BadgeBaseProps } from './BadgeBase.types';
import styleSheet from './BadgeBase.styles';

const BadgeBase: React.FC<BadgeBaseProps> = ({ children, style, ...props }) => {
  const { styles } = useStyles(styleSheet, {
    style,
  });

  return (
    <View style={styles.base} testID={BADGE_BASE_TEST_ID} {...props}>
      {children}
    </View>
  );
};

export default BadgeBase;
