import React, { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Cell, { CellVariant } from '../../design-system/components/Cells/Cell';
// Internal dependencies
import { NetworkConfiguration } from '@metamask/network-controller';
import { useSDK } from '@metamask/sdk-react';
import { useTranslation } from 'react-i18next';
import images from '../../../assets/images/image-icons';
import { LINEA_MAINNET } from '../../constants/networks.constants';
import { AvatarVariant } from '../../design-system/components/Avatars/Avatar';
import Text, { TextVariant } from '../../design-system/components/Texts/Text';
import Networks, {
  NetworkList,
  NetworkType,
  getAllTestsNetworks,
} from '../../utils/networks';
import styles from './NetworkSelector.styles';

import { ActivityIndicator } from 'react-native-paper';
import { AvatarProps } from '../../design-system/components/Avatars/Avatar/Avatar.types';
import { colors as importedColors } from '../../styles/common';
import { useAppTheme } from '../../theme';

export interface NetworkSelectorProps {
  showTestNetworks: boolean;
  goToNetworkSettings?: () => void;
  onSetRpcTarget?: (rpcUrl: string) => void;
  otherNetworks?: NetworkType[];
}

export const NetworkSelector = ({
  showTestNetworks: initialShowTestNetworks = false,
  otherNetworks,
  onSetRpcTarget,
}: NetworkSelectorProps) => {
  const { provider } = useSDK();
  const { t: strings } = useTranslation('network-selector');
  const { colors } = useAppTheme();
  const [showTestNetworks, setShowTestNetworks] = React.useState(
    initialShowTestNetworks,
  );
  // Set when a network switch is requested
  const [switchTo, setSwitchTo] = useState<string | undefined>(undefined);
  const { chainId: hexSelectedChainId } = useSDK();
  const selectedChainId = parseInt(hexSelectedChainId ?? '0', 16).toString();
  const networkConfigurations: Record<
    string,
    NetworkConfiguration & {
      id: string;
    }
  > = {};

  useEffect(() => {
    setShowTestNetworks(initialShowTestNetworks);
  }, [initialShowTestNetworks]);

  const handleNetworkChange = async (newChainId: number) => {
    // make newChainId as 0x{string}
    const hexChainId = `0x${newChainId.toString(16)}`;
    setSwitchTo(hexChainId);
    try {
      await provider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
    } catch (err) {
      // ignore error
    } finally {
      setSwitchTo(undefined);
    }
  };

  const renderMainnet = () => {
    const { name: mainnetName, chainId } = Networks.mainnet;
    const avatarProps: AvatarProps = {
      variant: AvatarVariant.Network,
      name: mainnetName,
      imageSource: images.ETHEREUM,
    };
    console.log(`avatarProps`, avatarProps);
    return (
      <Cell
        variant={CellVariant.Select}
        title={mainnetName}
        avatarProps={avatarProps}
        isSelected={chainId.toString() === selectedChainId}
        onPress={() => handleNetworkChange?.(chainId)}
      />
    );
  };

  const renderLineaMainnet = () => {
    const { name: lineaMainnetName, chainId } = NetworkList[LINEA_MAINNET];
    return (
      <Cell
        variant={CellVariant.Select}
        title={lineaMainnetName}
        avatarProps={{
          variant: AvatarVariant.Network,
          name: lineaMainnetName,
          imageSource: images['LINEA-MAINNET'],
        }}
        isSelected={chainId.toString() === selectedChainId}
        onPress={() => handleNetworkChange?.(chainId)}
      />
    );
  };

  const renderRpcNetworks = () =>
    Object.values(networkConfigurations).map(
      ({ nickname, rpcUrl, chainId }) => {
        if (!chainId) return null;
        const { name } = { name: nickname || rpcUrl };
        const image = getNetworkImageSource({ chainId: chainId?.toString() });

        return (
          <Cell
            key={chainId}
            variant={CellVariant.Select}
            title={name}
            avatarProps={{
              variant: AvatarVariant.Network,
              name,
              imageSource: image,
            }}
            isSelected={Boolean(chainId.toString() === selectedChainId)}
            onPress={() => onSetRpcTarget?.(rpcUrl)}
            style={styles.networkCell}
          />
        );
      },
    );

  const renderOtherNetworks = () => {
    return otherNetworks?.map((networkType) => {
      const { name, imageSource, chainId } = networkType;

      return (
        <Cell
          key={chainId}
          variant={CellVariant.Select}
          title={name}
          avatarProps={{
            variant: AvatarVariant.Network,
            name,
            imageSource,
          }}
          isSelected={chainId.toString() === selectedChainId}
          onPress={() => handleNetworkChange?.(chainId)}
        />
      );
    });
  };

  const renderTestsNetworks = () => {
    const testNetworks = getAllTestsNetworks();
    return testNetworks?.map((networkType) => {
      const { name, imageSource, chainId } = networkType;

      return (
        <Cell
          key={chainId}
          variant={CellVariant.Select}
          title={name}
          avatarProps={{
            variant: AvatarVariant.Network,
            name,
            imageSource,
          }}
          isSelected={chainId.toString() === selectedChainId}
          onPress={() => handleNetworkChange?.(chainId)}
        />
      );
    });
  };

  const renderTestNetworksSwitch = () => (
    <View style={styles.switchContainer}>
      <Text variant={TextVariant.BodyMD}>Show Test Networks</Text>
      <Switch
        onValueChange={(value: boolean) => {
          setShowTestNetworks(value);
        }}
        value={showTestNetworks}
        trackColor={{
          true: colors.primary.default,
          false: colors.border.muted,
        }}
        thumbColor={importedColors.white}
        ios_backgroundColor={colors.border.muted}
        disabled={false}
      />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.titleContainer}>
        <Text>{strings('Select Network')}</Text>
        {switchTo && <ActivityIndicator />}
      </View>
      <ScrollView>
        {renderMainnet()}
        {renderLineaMainnet()}
        {renderRpcNetworks()}
        {renderOtherNetworks()}
        {renderTestNetworksSwitch()}
        {showTestNetworks && renderTestsNetworks()}
      </ScrollView>
    </View>
  );
};

export default NetworkSelector;
