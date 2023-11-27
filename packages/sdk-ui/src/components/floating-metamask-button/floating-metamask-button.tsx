import { useSDK } from '@metamask/sdk-react';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  StyleSheet,
} from 'react-native';
import { Portal, FAB } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FABGroupFix from '../fab-group-fix/FabGroupFix';
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
      zIndex: 999,
    },
    fabStyle: {
      zIndex: 999,
    },
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

  const handlePress = (e: GestureResponderEvent) => {
    console.log(`pressed ${active}`);
    e.preventDefault();
  };

  const DynamicFabGroup = Platform.OS === 'web' ? FABGroupFix : FAB.Group;

  return (
    <Portal>
      <DynamicFabGroup
        open={active}
        visible
        icon={renderIcon}
        onPress={handlePress}
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
    </Portal>
  );
};
