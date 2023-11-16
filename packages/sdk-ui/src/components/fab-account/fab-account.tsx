import React, { useEffect } from 'react';
import { Animated, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { AnimatedFAB } from 'react-native-paper';

export interface FABAccountProps {
  /**
   * Animated value to be used for the FAB's position.
   */
  animatedValue?: Animated.Value;
  /**
   * Whether the FAB is currently visible.
   */
  visible?: boolean;
  /**
   * Whether the FAB is extended.
   */
  extended?: boolean;
  /**
   * Label text of the FAB.
   */
  label?: string;
  /**
   * Whether the FAB should be animated from the left or right.
   */
  animateFrom?: 'left' | 'right';
  /**
   * Style of the FAB.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Icon mode of the FAB.
   */
  iconMode?: 'static' | 'dynamic';
}

export const FABAccount = ({
  visible,
  extended,
  label,
  animateFrom,
  style,
  iconMode,
}: FABAccountProps) => {
  const [isExtended, setIsExtended] = React.useState(extended);

  useEffect(() => {
    setIsExtended(extended);
  }, [extended]);

  const fabStyle = { [animateFrom as string]: 16 };

  return (
    <AnimatedFAB
      icon={'plus'}
      label={label ?? 'extended label'}
      extended={!!isExtended}
      onPress={() => {
        console.log('Pressed');
        setIsExtended(!isExtended);
      }}
      visible={visible}
      animateFrom={animateFrom}
      iconMode={iconMode}
      style={[styles.fabStyle, style, fabStyle]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  fabStyle: {
    bottom: 50,
    right: 16,
    position: 'absolute',
  },
});
