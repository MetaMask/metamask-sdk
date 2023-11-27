import { useSDK } from '@metamask/sdk-react';

import color from 'color';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { usePreferences } from '../../context/preferences-provider';
import { useTheme } from '../../theme';
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
      padding: 5,
    },
  });
};

export interface Account {
  address: string;
  balance?: string;
}

export interface MetaMaskButtonProps {
  color?: 'blue' | 'white' | 'orange';
  shape?: 'rectangle' | 'rounded' | 'rounded-full';
  icon?: 'original' | 'simplified' | 'no-icon';
  text?: 'Connect MetaMask' | string;
  connectedComponent?: React.ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
}

export const MetaMaskButton = ({
  color: backgroundColor,
  shape,
  icon,
  text = 'Connect wallet',
  buttonStyle,
}: // connectedType = 'network-account-balance', // keep for reference and future implementation
MetaMaskButtonProps) => {
  const { sdk, connected, error, account, chainId } = useSDK();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const { darkMode } = usePreferences();

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
    const orange500 = '#f97316';
    const red500 = '#ef4444';
    const blue500 = '#3b82f6';
    const white = '#ffffff';

    let bgColor = orange500;

    if (!connected && error) {
      bgColor = red500;
    } else if (connected) {
      bgColor = colors.background.default;
    } else if (backgroundColor === 'blue') {
      bgColor = blue500;
    } else if (backgroundColor === 'orange') {
      bgColor = orange500;
    } else if (backgroundColor === 'white') {
      bgColor = white;
    }

    if (darkMode) {
      bgColor = color(bgColor).darken(0.3).hex(); // Darken the color by 30%
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
    <ConnectButton text={text} icon={icon} color={backgroundColor} />
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
