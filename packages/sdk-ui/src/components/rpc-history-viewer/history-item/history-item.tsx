/* eslint-disable react-native/no-inline-styles */
import { RPCMethodResult } from '@metamask/sdk-communication-layer';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from '../../../design-system/components/Texts/Text';
import { Theme } from '../../../theme/models';
import { useTheme } from '../../../theme';

const getStyles = ({}: { theme: Theme }) =>
  StyleSheet.create({
    centeredRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      fontWeight: 'bold',
    },
  });

export interface HistoryItemProps {
  entry: RPCMethodResult;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ entry }) => {
  const contentStyle: StyleProp<ViewStyle> = {};
  const theme = useTheme();
  const styles = useMemo(() => getStyles({ theme }), [theme]);

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.centeredRow}>
        <Text style={styles.title}>Id:</Text>
        <Text>{entry.id}</Text>
      </View>
      <View style={styles.centeredRow}>
        <Text style={styles.title}>Method:</Text>
        <Text>{entry.method}</Text>
      </View>
      <View style={[styles.centeredRow, contentStyle]}>
        <Text style={styles.title}>Result:</Text>
        <Text ellipsizeMode="middle">
          {JSON.stringify(entry.result, null, 2)}
        </Text>
      </View>
      <View style={[styles.centeredRow, contentStyle]}>
        <Text style={styles.title}>Error:</Text>
        <Text>{JSON.stringify(entry.error, null, 2)}</Text>
      </View>
      <View style={styles.centeredRow}>
        <Text style={styles.title}>Elapsed Time:</Text>
        <Text>{entry.elapsedTime ? `${entry.elapsedTime} ms` : 'N/A'}</Text>
      </View>
      <View style={styles.centeredRow}>
        <Text style={styles.title}>Timestamp:</Text>
        <Text>{new Date(entry.timestamp).toLocaleString()}</Text>
      </View>
    </View>
  );
};
