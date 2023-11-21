import { useSDK } from '@metamask/sdk-react';
import Toast from '../../design-system/components/Toast/Toast';
import { ToastContext } from '../../design-system/components/Toast/Toast.context';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getNetworkByHexChainId } from '../../utils/networks';
import { SDKSummary } from '../sdk-summary/sdk-summary';
import { ConnectButton } from './connect-button/connect-button';
import { ConnectedButton } from './connected-button/connected-button';

const getStyles = () => {
  return StyleSheet.create({
    buttonContainer: {
      // backgroundColor: '#E5E5E5',
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      borderWidth: 1,
      // center and vertically align
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
    },
    buttonOpen: {
      backgroundColor: '#F194FF',
    },
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
    modalContainer: {
      marginLeft: 20,
      marginRight: 20,
      backgroundColor: 'white',
      zIndex: 1000,
      padding: 10,
      borderRadius: 5,
      shadowColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  });
};

export interface Account {
  address: string;
  balance?: string;
}

export interface MetaMaskButtonProps {
  color?: 'blue' | 'white' | 'orange';
  theme?: 'dark' | 'light';
  shape?: 'rectangle' | 'rounded' | 'rounded-full';
  icon?: 'original' | 'simplified' | 'no-icon';
  text?: 'Connect with MetaMask' | string;
  connectedComponent?: React.ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
}

export const MetaMaskButton = ({
  color,
  theme = 'dark',
  shape,
  icon,
  text = 'Connect with MetaMask',
  buttonStyle,
}: // connectedType = 'network-account-balance', // keep for reference and future implementation
MetaMaskButtonProps) => {
  const { sdk, connected, error, balance, account, chainId } = useSDK();
  const styles = useMemo(() => getStyles(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const { toastRef } = useContext(ToastContext);

  useEffect(() => {
    console.log('sdk', sdk);
    console.log('connected', connected);
    if (!connected) {
      setModalOpen(false);
    }
  }, [sdk, connected]);

  const network = useMemo(() => {
    return chainId ? getNetworkByHexChainId(chainId) : undefined;
  }, [chainId]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    console.debug(`closing modal`);
    setModalOpen(false);
  };

  const connect = async () => {
    try {
      await sdk?.connect();
    } catch (err) {
      console.error(` failed to connect `, err);
    }
  };

  const getColors = () => {
    const white010 = '#FCFCFC';
    const orange500 = '#f97316';
    const red500 = '#ef4444';
    const blue500 = '#3b82f6';
    const white = '#ffffff';

    let bgColor = orange500;

    if (!connected && error) {
      bgColor = red500;
    } else if (connected && theme === 'light') {
      bgColor = white;
    } else if (connected) {
      bgColor = white010;
    } else if (color === 'blue') {
      bgColor = blue500;
    } else if (color === 'white') {
      bgColor = white;
    }

    return {
      backgroundColor: bgColor,
    };
  };

  const getShape = () => {
    if (shape === 'rectangle') {
      return { borderRadius: 0 };
    } else if (shape === 'rounded-full') {
      return { borderRadius: 9999 };
    }

    return { borderRadius: 8 };
  };

  const formattedBalance = useMemo(() => {
    if (!balance) {
      return '0.00';
    }
    // Convert the hexadecimal balance to a decimal number
    const balanceInWei = parseInt(balance, 16);

    // Assuming the balance is in Wei (for Ethereum), convert it to Ether.
    // 1 Ether = 1e18 Wei
    const balanceInEther = balanceInWei / 1e18;

    // Format the number to a string with two decimal places
    return balanceInEther.toFixed(2);
  }, [balance]);

  const renderConnected = () => (
    <ConnectedButton
      containerStyle={[buttonStyle, getColors()]}
      balance={formattedBalance}
      active={modalOpen}
      network={network?.shortName ?? 'Unknown'}
      address={account ?? ''}
    />
  );

  const renderDisconnected = () => (
    <ConnectButton text={text} icon={icon} color={color} />
  );

  return (
    <>
      <Pressable
        style={[styles.buttonContainer, getShape(), getColors()]}
        onPress={connected ? openModal : connect}
      >
        {connected && renderConnected()}
        {!connected && renderDisconnected()}
      </Pressable>
      <Modal visible={modalOpen} transparent={true} onDismiss={closeModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <SDKSummary />
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <MaterialCommunityIcons name="close" size={24} />
            </TouchableOpacity>
          </View>
        </View>
        <Toast ref={toastRef} />
      </Modal>
    </>
  );
};
