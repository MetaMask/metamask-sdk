import { useSDK } from '@metamask/sdk-react';

import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { getNetworkByHexChainId } from '../../utils/networks';
import { MetaMaskModal } from '../metamask-modal/metamask-modal';
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
  const { sdk, connected, error, account, chainId } = useSDK();
  const styles = useMemo(() => getStyles(), []);
  const [modalOpen, setModalOpen] = useState(false);

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

  const renderConnected = () => (
    <ConnectedButton
      containerStyle={[buttonStyle, getColors()]}
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
      <MetaMaskModal modalOpen={modalOpen} onClose={closeModal} />
    </>
  );
};
