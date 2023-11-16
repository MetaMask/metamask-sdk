import { useSDK } from '@metamask/sdk-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSimplified } from '../icons/IconsSimplified';

const getStyles = () => {
  return StyleSheet.create({
    buttonContainer: {
      backgroundColor: '#E5E5E5',
      display: 'flex',
      flexDirection: 'row',
      // center and vertically align
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
    },
    fullScreenModal: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
      backgroundColor: 'transparent', // Transparent background
    },
    modalContainer: {
      position: 'absolute',
      top: 50, // Adjust as needed
      left: 0,
      right: 0,
      backgroundColor: 'white',
      width: '100%',
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
    closeButton: {
      borderWidth: 1,
      padding: 5,
    },
  });
};

export interface Account {
  address: string;
  balance?: string;
}

interface Props {
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
Props) => {
  const { sdk, connected } = useSDK();
  const styles = useMemo(() => getStyles(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<ButtonLayout | null>(null);

  useEffect(() => {
    console.log('sdk', sdk);
    console.log('connected', connected);
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

  const handleOutsidePress = () => {
    closeModal();
  };

  const handleModalPress = (event: any) => {
    event.stopPropagation(); // Prevent the press event from propagating to the full-screen view
  };

  return (
    <>
      <Pressable
        onLayout={handleButtonLayout}
        style={styles.buttonContainer}
        onPress={connected ? openModal : connect}
      >
        {/* <IconSimplified color='orange' style={{}} /> */}
        <Text>{connected ? 'YEAH' : text}</Text>
      </Pressable>
      {modalOpen && buttonLayout && (
        <Pressable style={styles.fullScreenModal} onPress={handleOutsidePress}>
          <View
            style={[
              styles.modalContainer,
              { top: buttonLayout.y + buttonLayout.height }, // Position below the button
            ]}
            onStartShouldSetResponder={() => true} // Capture touch events
            onResponderRelease={handleModalPress} // Handle touch release
          >
            <Text>Option 1</Text>
            <Text>Option 2</Text>
            <Text>Option 3</Text>
            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Text>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </>
  );
};
