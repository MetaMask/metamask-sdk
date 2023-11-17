import React, { useCallback, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { IconButton, Snackbar, Text } from 'react-native-paper';

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

interface AddressCopyButtonProps {
  address: string;
  showAddress?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  containerStyle?: StyleProp<ViewStyle>;
  handleCopy?: (_: string) => void;
}

export const AddressCopyButton: React.FC<AddressCopyButtonProps> = ({
  address,
  size = 'sm',
  showAddress = true,
  containerStyle,
  handleCopy,
}) => {
  const [visible, setVisible] = useState(false);

  const handleCopied = useCallback(() => {
    handleCopy?.(address);
    if (!handleCopy) {
      console.warn(`No handleCopy function provided for address ${address}`);
    }
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 1000);
  }, [address, handleCopy]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable style={styles.pressable} onPress={handleCopied}>
        {showAddress && (
          <Text ellipsizeMode="middle" numberOfLines={1} style={styles.address}>
            {address}
          </Text>
        )}
        <IconButton icon="content-copy" size={sizeMap[size]} />
      </Pressable>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={1000}
      >
        {'Copied to clipboard'}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '80%',
  },
  pressable: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 5,
    flexShrink: 1,
    borderWidth: 1,
  },
  address: {},
});
