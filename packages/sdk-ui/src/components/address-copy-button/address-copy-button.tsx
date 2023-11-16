import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Snackbar } from 'react-native-paper';

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

interface AddressCopyButtonProps {
  address: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  handleCopy?: (_: string) => void;
}

export const AddressCopyButton: React.FC<AddressCopyButtonProps> = ({
  address,
  size = 'sm',
  handleCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleCopied = useCallback(() => {
    handleCopy?.(address);
    if (!handleCopy) {
      console.warn(`No handleCopy function provided for address ${address}`);
    }
    setCopied(true);
    setVisible(true);
    setTimeout(() => {
      setCopied(false);
      setVisible(false);
    }, 1000);
  }, [address, handleCopy]);

  return (
    <View style={styles.center}>
      <IconButton
        icon="content-copy"
        size={sizeMap[size]}
        onPress={handleCopied}
      />
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={1000}
      >
        {copied ? 'Copied!' : 'Copy address to clipboard'}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
