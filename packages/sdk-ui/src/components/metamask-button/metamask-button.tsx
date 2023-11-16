import { useSDK } from '@metamask/sdk-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { IconSimplified } from '../icons/IconsSimplified';
import { IconOriginal } from '../icons/IconOriginal';
import Jazzicon from 'react-native-jazzicon';

const getStyles = () => {
  return StyleSheet.create({
    buttonContainer: {
      // backgroundColor: '#E5E5E5',
      display: 'flex',
      width: '100%',
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

  const handleOutsidePress = () => {
    closeModal();
  };

  const handleModalPress = (event: any) => {
    event.stopPropagation(); // Prevent the press event from propagating to the full-screen view
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

  const getIcon = () => {
    if (icon === 'no-icon') {
      return null;
    } else if (icon === 'original') {
      return <IconOriginal />;
    }

    return <IconSimplified color={color === 'white' ? 'orange' : 'white'} />;
  };

  return (
    <>
      <Pressable
        onLayout={handleButtonLayout}
        style={[styles.buttonContainer, getShape(), getColors()]}
        onPress={connected ? openModal : connect}
      >
        <View style={{ borderWidth: 1, padding: 5 }}>
          {connected ? (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                paddingRight: 15,
                paddingLeft: 15,
                // backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Jazzicon size={32} address={account} />
              <Text
                ellipsizeMode="middle"
                numberOfLines={1}
                style={{ paddingLeft: 10 }}
              >
                {account}
              </Text>
            </View>
          ) : (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {getIcon()}
              <Text>{text}</Text>
            </View>
          )}
        </View>
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
