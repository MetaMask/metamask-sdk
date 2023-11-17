import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Jazzicon from 'react-native-jazzicon';
import { Text } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export interface ConnectedButtonProps {
  network: string;
  address: string;
  balance: number;
  active?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function ConnectedButton({
  active,
  address,
  balance,
  network,
  containerStyle,
}: ConnectedButtonProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Jazzicon size={32} address={address} />
      <View style={styles.content}>
        <Text style={styles.network} variant="titleMedium">
          {network}
        </Text>
        <Text ellipsizeMode="middle" numberOfLines={1} style={styles.address}>
          {address}
        </Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text ellipsizeMode="middle" numberOfLines={1}>
          {balance}
        </Text>
        <Text>ETH</Text>
      </View>
      <MaterialIcons
        name={active ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
        size={24}
        color="black"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 5,
    flex: 1,
    gap: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  balanceContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    gap: 5,
    backgroundColor: '#E2E2E2',
  },
  icon: { padding: 5 },
  network: {},
  address: {},
});
