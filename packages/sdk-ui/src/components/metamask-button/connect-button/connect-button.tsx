import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { IconOriginal } from '../../icons/IconOriginal';
import { IconSimplified } from '../../icons/IconsSimplified';
import { MetaMaskButtonProps } from '../../metamask-button/metamask-button';
import { useSDK } from '@metamask/sdk-react';
import Text from '../../../design-system/components/Texts/Text';

export interface ConnectButtonProps {
  icon: MetaMaskButtonProps['icon'];
  color: MetaMaskButtonProps['color'];
  text?: MetaMaskButtonProps['text'];
  containerStyle?: StyleProp<ViewStyle>;
}
export const ConnectButton = ({
  icon,
  text = 'Connect MetaMask',
  color,
  containerStyle,
}: ConnectButtonProps) => {
  const { connecting } = useSDK();

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
        {connecting ? (
          <ActivityIndicator />
        ) : (
          <Text
            ellipsizeMode="middle"
            numberOfLines={1}
            style={styles.accountText}
          >
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

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
