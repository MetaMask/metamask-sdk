import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { IconOriginal } from '../icons/IconOriginal';
import { IconSimplified } from '../icons/IconsSimplified';
import { MetaMaskButtonProps } from '../metamask-button/metamask-button';

export interface ConnectButtonProps {
  icon: MetaMaskButtonProps['icon'];
  color: MetaMaskButtonProps['color'];
  text?: MetaMaskButtonProps['text'];
  containerStyle?: StyleProp<ViewStyle>;
}
export default function ConnectButton({
  icon,
  text = 'Connect MetaMask',
  color,
  containerStyle,
}: ConnectButtonProps) {
  const getIcon = () => {
    if (icon === 'no-icon') {
      return null;
    } else if (icon === 'original') {
      return <IconOriginal />;
    }

    return <IconSimplified color={color === 'white' ? 'orange' : 'white'} />;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.icon}>{getIcon()}</View>
      <View style={styles.content}>
        <Text
          ellipsizeMode="middle"
          numberOfLines={1}
          style={styles.accountText}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    padding: 5,
    flexDirection: 'row',
    paddingRight: 15,
    paddingLeft: 15,
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  icon: { padding: 5 },
  accountText: {
    paddingLeft: 10,
  },
});
