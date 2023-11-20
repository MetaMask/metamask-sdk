import React, { useCallback, useContext } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import {
  ToastContext,
  ToastVariants,
} from '../../design-system/components/Toast';

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
  const { toastRef } = useContext(ToastContext);

  const handleCopied = useCallback(() => {
    handleCopy?.(address);
    if (!handleCopy) {
      console.warn(`No handleCopy function provided for address ${address}`);
    }

    console.log(`toastRef`, toastRef);
    toastRef?.current?.showToast({
      variant: ToastVariants.Plain,
      labelOptions: [{ label: 'Copied to clipboard' }],
    });
  }, [address, handleCopy, toastRef]);

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
