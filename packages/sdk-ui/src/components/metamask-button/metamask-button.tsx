import { useSDK } from '@metamask/sdk-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import ConnectButton from '../connect-button/connect-button';
import ConnectedButton from '../connected-button/connected-button';
import { SDKSummary } from '../sdk-summary-modal/sdk-summary-modal';

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
    fullScreenModal: {
      // center modal in screen
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // position: 'absolute',
      // top: 0,
      // left: 0,
      // right: 0,
      // bottom: 0,
      // zIndex: 999,
      // backgroundColor: 'transparent', // Transparent background
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
  iconPosition?: 'left' | 'right';
  text?: 'Connect wallet' | 'MetaMask' | 'Connect with MetaMask' | string;
  textAlign?: 'middle' | 'left';
  buttonStyle?: any;
  textStyle?: any;
  iconStyle?: any;
  removeDefaultStyles?: boolean;
  connectComponent?: React.ReactNode;
  wrongNetworkComponent?: React.ReactNode;
  wrongNetworkText?: 'Wrong network' | 'Switch network' | string;
  connectedComponent?: React.ReactNode;
  connectedType?:
    | 'custom-text'
    | 'network-account-balance'
    | 'network-account'
    | 'account-balance'
    | 'separate-network-account';
  connectedText?: 'Connected';
}

interface ButtonLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MetaMaskButton = ({
  color,
  theme = 'dark',
  shape,
  icon,
  iconPosition,
  text = 'Connect wallet',
  textAlign,
  buttonStyle,
  textStyle,
  iconStyle,
  removeDefaultStyles,
  connectComponent,
  wrongNetworkComponent,
  wrongNetworkText = 'Switch network',
  connectedComponent,
}: // connectedType = 'network-account-balance', // keep for reference and future implementation
MetaMaskButtonProps) => {
  const { sdk, connected, error, account } = useSDK();
  const styles = useMemo(() => getStyles(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<ButtonLayout | null>(null);

  useEffect(() => {
    console.log('sdk', sdk);
    console.log('connected', connected);
    if (!connected) {
      setModalOpen(false);
    }
  }, [sdk, connected]);

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

  const handleButtonLayout = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setButtonLayout({ x, y, width, height });
  };

  const getColors = () => {
    const neutral500 = '#737373';
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
      bgColor = neutral500;
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

  return (
    <>
      <Pressable
        style={[styles.buttonContainer, getShape(), getColors()]}
        onPress={connected ? openModal : connect}
      >
        {connected ? (
          <ConnectedButton
            containerStyle={[buttonStyle, getColors()]}
            balance={0}
            active={modalOpen}
            network={'Ethereum'}
            address={account ?? ''}
          />
        ) : (
          <ConnectButton icon={icon} color={color} />
        )}
      </Pressable>
      <Portal>
        <Modal
          visible={modalOpen}
          onDismiss={closeModal}
          contentContainerStyle={styles.modalContainer}
        >
          <SDKSummary />
        </Modal>
      </Portal>
    </>
  );
};
