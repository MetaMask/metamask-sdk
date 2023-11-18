import React from 'react';
import { Platform, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Cell, { CellVariant } from '../../design-system/components/Cells/Cell';
// Internal dependencies
import { NetworkConfiguration } from '@metamask/network-controller';
import { useSDK } from '@metamask/sdk-react';
import images from 'images/image-icons';
import { useTranslation } from 'react-i18next';
import { LINEA_MAINNET } from '../../constants/networks.constants';
import { AvatarVariant } from '../../design-system/components/Avatars/Avatar';
import Text from '../../design-system/components/Texts/Text';
import Networks, {
  NetworkList,
  getNetworkImageSource,
} from '../../utils/networks';
import styles from './NetworkSelector.styles';

import Button, {
  ButtonSize,
  ButtonVariants,
  ButtonWidthTypes,
} from '../../design-system/components/Buttons/Button';
import generateTestId from '../../utils/generateTestId';

export interface NetworkSelectorProps {
  showTestNetworks: boolean;
  goToNetworkSettings?: () => void;
  onSetRpcTarget?: (rpcUrl: string) => void;
  onNetworkChange?: (type: string) => void;
}

export const NetworkSelector = ({
  showTestNetworks,
  onNetworkChange,
  goToNetworkSettings,
  onSetRpcTarget,
}: NetworkSelectorProps) => {
  const { t: strings } = useTranslation('network-selector');

  const { chainId: selectedChainId } = useSDK();
  const networkConfigurations: Record<
    string,
    NetworkConfiguration & {
      id: string;
    }
  > = {};

  const renderMainnet = () => {
    const { name: mainnetName, chainId } = Networks.mainnet;
    return (
      <Cell
        variant={CellVariant.Select}
        title={mainnetName}
        avatarProps={{
          variant: AvatarVariant.Network,
          name: mainnetName,
          imageSource: images.ETHEREUM,
        }}
        isSelected={chainId.toString() === selectedChainId}
        onPress={() => onNetworkChange?.(mainnetName)}
        style={styles.networkCell}
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

  // const renderOtherNetworks = () => {
  //   const getOtherNetworks = () => getAllNetworks().slice(2);
  //   return getOtherNetworks().map((networkType) => {
  //     // TODO: Provide correct types for network.
  //     const { name, imageSource, chainId } = (Networks as any)[networkType];

  //     return (
  //       <Cell
  //         key={chainId}
  //         variant={CellVariant.Select}
  //         title={name}
  //         avatarProps={{
  //           variant: AvatarVariant.Network,
  //           name,
  //           imageSource,
  //         }}
  //         isSelected={chainId.toString() === providerConfig.chainId}
  //         onPress={() => onNetworkChange(networkType)}
  //         style={styles.networkCell}
  //       />
  //     );
  //   });
  // };

  // const renderTestNetworksSwitch = () => (
  //   <View style={styles.switchContainer}>
  //     <Text variant={'bodyMedium'}>Show Test Networks</Text>
  //     <Switch
  //       onValueChange={(value: boolean) => {
  //         const { PreferencesController } = Engine.context;
  //         PreferencesController.setShowTestNetworks(value);
  //       }}
  //       value={isTestNet(providerConfig.chainId) || showTestNetworks}
  //       trackColor={{
  //         true: colors.primary.default,
  //         false: colors.border.muted,
  //       }}
  //       thumbColor={importedColors.white}
  //       ios_backgroundColor={colors.border.muted}
  //       {...generateTestId(Platform, NETWORK_TEST_SWITCH_ID)}
  //       disabled={isTestNet(providerConfig.chainId)}
  //     />
  //   </View>
  // );

  return (
    <View>
      <Text>Select Network</Text>
      <ScrollView>
        {renderMainnet()}
        {renderLineaMainnet()}
        {renderRpcNetworks()}
        {/* {renderTestNetworksSwitch()} */}
        {/* {showTestNetworks && renderOtherNetworks()} */}
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
