import React from 'react';
import { Platform, Switch, View } from 'react-native';
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
import Networks, { NetworkList, getAllNetworks } from '../../utils/networks';
import styles from './NetworkSelector.styles';

import Button, {
  ButtonSize,
  ButtonVariants,
  ButtonWidthTypes,
} from '../../design-system/components/Buttons/Button';
import { colors as importedColors } from '../../styles/common';
import { useAppTheme } from '../../theme';
import generateTestId from '../../utils/generateTestId';
import { AvatarProps } from '../../design-system/components/Avatars/Avatar/Avatar.types';

export interface NetworkSelectorProps {
  showTestNetworks: boolean;
  goToNetworkSettings?: () => void;
  onSetRpcTarget?: (rpcUrl: string) => void;
  onNetworkChange?: (type: string) => void;
}

export const NetworkSelector = ({
  showTestNetworks: initialShowTestNetworks = false,
  onNetworkChange,
  goToNetworkSettings,
  onSetRpcTarget,
}: NetworkSelectorProps) => {
  const { t: strings } = useTranslation('network-selector');
  const { colors } = useAppTheme();
  const [showTestNetworks, setShowTestNetworks] = React.useState(
    initialShowTestNetworks,
  );
  const { chainId: hexSelectedChainId } = useSDK();
  const selectedChainId = parseInt(hexSelectedChainId ?? '0', 16).toString();
  const networkConfigurations: Record<
    string,
    NetworkConfiguration & {
      id: string;
    }
  > = {};

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
        onPress={() => onNetworkChange?.(mainnetName)}
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
        onPress={() => onNetworkChange?.(LINEA_MAINNET)}
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
    const getOtherNetworks = () => getAllNetworks().slice(2);
    return getOtherNetworks().map((networkType) => {
      // TODO: Provide correct types for network.
      const { name, imageSource, chainId } = (Networks as any)[networkType];

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
          onPress={() => onNetworkChange?.(networkType)}
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
    <View style={{ flex: 1 }}>
      <Text>Select Network</Text>
      <ScrollView>
        {renderMainnet()}
        {renderLineaMainnet()}
        {renderRpcNetworks()}
        {renderTestNetworksSwitch()}
        {showTestNetworks && renderOtherNetworks()}
      </ScrollView>

      <Button
        variant={ButtonVariants.Secondary}
        label={strings('app_settings.network_add_network')}
        onPress={() => goToNetworkSettings?.()}
        width={ButtonWidthTypes.Full}
        size={ButtonSize.Lg}
        style={styles.addNetworkButton}
        {...generateTestId(Platform, 'add-network-button')}
      />
    </View>
  );
};

export default NetworkSelector;
