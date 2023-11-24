import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useTheme } from '../../theme';
import { Text } from '@metamask/sdk-ui';
import { Theme } from '@metamask/design-tokens';

export interface ItemViewProps {
  label: string;
  value?: string;
  processing?: boolean;
  error?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

const getStyles = ({ theme }: { theme: Theme }) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      padding: 8,
      backgroundColor: theme.colors.background.default,
      border: '1px solid black',
      borderRadius: 8,
      margin: 8,
      // width: '100%',
    },
    label: {
      fontWeight: 'bold',
    },
    content: {
      paddingLeft: 5,
      paddingTop: 5,
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      maxWidth: '100%',
    },
  });

export const ItemView = ({
  label,
  value,
  error,
  processing,
  containerStyle,
  contentStyle,
}: ItemViewProps) => {
  const theme = useTheme();
  const styles = useMemo(() => getStyles({ theme }), [theme]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.content, contentStyle]}>
        {processing ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text
            style={{
              color: error
                ? theme.colors.error.default
                : theme.colors.text.default,
            }}
          >
            {value}
          </Text>
        )}
      </View>
    </View>
  );
};
