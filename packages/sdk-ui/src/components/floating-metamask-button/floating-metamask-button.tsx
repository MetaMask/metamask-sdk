import { useSDK } from '@metamask/sdk-react';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  StyleSheet,
} from 'react-native';
import { FAB } from 'react-native-paper';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FABGroupFix from '../fab-group-fix/FabGroupFix';
import { IconOriginal } from '../icons/IconOriginal';
import {
  MetaMaskModal,
  MetaMaskModalProps,
} from '../metamask-modal/metamask-modal';

export interface ActionConfig {
  label: string;
  icon: string;
  onPress: () => void;
}
export interface FloatingMetaMaskButtonProps {
  distance?: {
    bottom?: number;
    right?: number;
  };
  network?: boolean;
  swap?: boolean;
  buy?: boolean;
  gasprice?: boolean;
  customActions?: ActionConfig[];
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

// Icon component defined outside
const InfuraGasPriceIcon = ({ color }: { color: string }) => {
  return <MaterialIcons name="price-change" color={color} size={24} />;
};

export const FloatingMetaMaskButton = ({
  distance,
  network,
  swap,
  buy,
  gasprice,
  customActions,
}: FloatingMetaMaskButtonProps) => {
  const { sdk, connected, connecting, provider } = useSDK();
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [target, setTarget] = useState<MetaMaskModalProps['target']>('network');
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
        return;
      }
    }
    setActive(open);
  };

  const handlePress = (e: GestureResponderEvent) => {
    e.preventDefault();
  };

  // Check for mobile browser because regular FAB.Group has an issue https://github.com/callstack/react-native-paper/issues/4202
  const isMobileBrowser =
    Platform.OS === 'web' && /Mobi|Android/i.test(navigator.userAgent);
  const DynamicFabGroup = isMobileBrowser ? FABGroupFix : FAB.Group;

  const generateActions = () => {
    const actions = [];

    if (network) {
      actions.push({
        label: 'Network',
        icon: 'swap-horizontal',
        onPress: () => {
          setTarget('network');
          setModalOpen(true);
        },
      });
    }

    if (swap) {
      actions.push({
        label: 'SWAP',
        icon: 'swap-horizontal',
        onPress: () => {
          setTarget('swap');
          setModalOpen(true);
        },
      });
    }

    if (buy) {
      actions.push({
        label: 'Buy ETH',
        icon: 'swap-horizontal',
        onPress: () => {
          provider?.request({
            method: 'metamask_open',
            params: [{ target: 'buy' }],
          });
        },
      });
    }

    if (gasprice) {
      actions.push({
        icon: InfuraGasPriceIcon,
        label: 'Infura GAS Api',
        onPress: () => {
          setTarget('gasprice');
          setModalOpen(true);
        },
      });
    }

    // Add customActions
    if (customActions) {
      actions.push(...customActions);
    }

    // Additional action for disconnection
    actions.push({
      label: 'Disconnect',
      icon: 'logout',
      onPress: () => {
        sdk?.terminate();
        setActive(false);
      },
    });

    return actions;
  };

  return (
    <>
      <DynamicFabGroup
        open={active}
        visible
        icon={renderIcon}
        onPress={handlePress}
        fabStyle={styles.fabStyle}
        style={styles.container}
        actions={generateActions()}
        onStateChange={handleStateChange}
      />
      <MetaMaskModal
        modalOpen={modalOpen}
        target={target}
        onClose={closeModal}
      />
    </>
  );
};
