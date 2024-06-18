import Toast from '../../design-system/components/Toast/Toast';
import { ToastContext } from '../../design-system/components/Toast/Toast.context';

import React, { useContext, useMemo } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SDKSummary } from '../sdk-summary/sdk-summary';
import { useSDK } from '@metamask/sdk-react';
import { useTheme } from '../../theme';
import { Theme } from '@metamask/design-tokens';
import { SwapPanel } from '../swap-panel/swap-panel';
import { GasPricePanel } from '../gasprice-panel/gasprice-panel';

export interface MetaMaskModalProps {
  modalOpen: boolean;
  target?: 'network' | 'swap' | 'gasprice';
  onClose?: () => void;
}

const getStyles = ({ theme }: { theme: Theme }) => {
  return StyleSheet.create({
    closeButton: {
      position: 'absolute',
      right: 10,
      top: 10,
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
      margin: 10,
      backgroundColor: theme.colors.background.default,
      borderRadius: 20,
      zIndex: 1000,
      padding: 10,
      width: 500,
      height: 500,
      maxHeight: '95%',
      maxWidth: '95%',
      minWidth: 200,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  });
};

export const MetaMaskModal = ({
  modalOpen,
  target = 'network',
  onClose,
}: MetaMaskModalProps) => {
  const { toastRef } = useContext(ToastContext);
  const { connected } = useSDK();
  const theme = useTheme();
  const styles = useMemo(() => getStyles({ theme }), [theme]);

  return (
    <Modal
      visible={modalOpen && connected}
      transparent={true}
      onDismiss={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {target === 'network' && <SDKSummary />}
          {target === 'swap' && <SwapPanel />}
          {target === 'gasprice' && <GasPricePanel />}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.text.muted}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Toast ref={toastRef} />
    </Modal>
  );
};
