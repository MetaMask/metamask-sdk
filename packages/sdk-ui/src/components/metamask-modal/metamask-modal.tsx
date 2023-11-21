import Toast from '../../design-system/components/Toast/Toast';
import { ToastContext } from '../../design-system/components/Toast/Toast.context';

import React, { useContext, useMemo } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SDKSummary } from '../sdk-summary/sdk-summary';
import { useSDK } from '@metamask/sdk-react';

export interface MetaMaskModalProps {
  modalOpen: boolean;
  onClose?: () => void;
}

const getStyles = () => {
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
      backgroundColor: 'white',
      borderRadius: 20,
      zIndex: 1000,
      padding: 10,
      maxWidth: '95%',
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

export const MetaMaskModal = ({ modalOpen, onClose }: MetaMaskModalProps) => {
  const { toastRef } = useContext(ToastContext);
  const { connected } = useSDK();
  const styles = useMemo(() => getStyles(), []);

  return (
    <Modal
      visible={modalOpen && connected}
      transparent={true}
      onDismiss={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <SDKSummary />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} />
          </TouchableOpacity>
        </View>
      </View>
      <Toast ref={toastRef} />
    </Modal>
  );
};
