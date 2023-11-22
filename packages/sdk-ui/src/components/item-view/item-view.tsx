import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Text from '../../design-system/components/Texts/Text';
import { useTheme } from '../../theme';

export interface ItemViewProps {
  label: string;
  value?: string;
  processing?: boolean;
  error?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 8,
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
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.content, contentStyle]}>
        {processing ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text
            style={{
              color: error ? colors.error.default : colors.text.default,
            }}
          >
            {value}
          </Text>
        )}
      </View>
    </View>
  );
};
