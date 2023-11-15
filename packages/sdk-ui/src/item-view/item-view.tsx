import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
// import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface ItemViewProps {
  label: string;
  value?: string;
  processing?: boolean;
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
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    maxWidth: '100%',
  },
});

export const ItemView = ({
  label,
  value,
  processing,
  containerStyle,
  contentStyle,
}: ItemViewProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.content, contentStyle]}>
        {processing ? (
          <View>
            {/* DISABLED until finding a fix for CRA setup */}
            {/* <FontAwesome name="spinner" size={30} color="#900" /> */}
            <ActivityIndicator size="small" color="#00ff00" />
          </View>
        ) : (
          value
        )}
      </View>
    </View>
  );
};
