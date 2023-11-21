import { useSDK } from '@metamask/sdk-react';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { IconOriginal } from '../icons/IconOriginal';
import { MetaMaskModal } from '../metamask-modal/metamask-modal';

export interface FloatingMetaMaskButtonProps {
  distance?: {
    bottom?: number;
    right?: number;
  };
}

const getStyles = ({
  distance,
}: {
  distance: FloatingMetaMaskButtonProps['distance'];
}) => {
  return StyleSheet.create({
    container: {
      position: Platform.OS === 'web' ? 'fixed' : ('absolute' as any),
      paddingRight: distance?.right,
      paddingBottom: distance?.bottom,
    },
    fabStyle: {},
  });
};

export const FloatingMetaMaskButton = ({
  distance,
}: FloatingMetaMaskButtonProps) => {
  const { sdk, connected, connecting } = useSDK();
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState(false);
  const styles = useMemo(() => getStyles({ distance }), [distance]);

  const renderIcon = ({ color }: { color: string }) => {
    if (connecting) {
      return <ActivityIndicator color={color} />;
    }
    return <IconOriginal />;
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleStateChange = async ({ open }: { open: boolean }) => {
    if (!connected) {
      try {
        await sdk?.connect();
        return;
      } catch (error) {
        // Ignore connection issue.
      }
    }
    setActive(open);
  };

  return (
    <>
      <FAB.Group
        open={active}
        visible
        icon={renderIcon}
        fabStyle={styles.fabStyle}
        style={styles.container}
        actions={[
          {
            icon: () => <IconOriginal />,
            label: 'Open MetaMask',
            onPress: () => console.log('Pressed notifications'),
          },
          {
            label: 'Network',
            icon: 'swap-horizontal',
            onPress: () => setModalOpen(true),
          },
          {
            icon: ({ color }) => (
              <MaterialIcons name="price-change" color={color} size={24} />
            ),
            label: 'GAS Api',
            onPress: () => console.log('Pressed notifications'),
          },
          {
            label: 'Disconnect',
            icon: 'logout',
            onPress: () => sdk?.disconnect(),
          },
        ]}
        onStateChange={handleStateChange}
      />
      <MetaMaskModal modalOpen={modalOpen} onClose={closeModal} />
    </>
  );
};
