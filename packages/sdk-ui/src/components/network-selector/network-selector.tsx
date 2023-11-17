import React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { AvatarVariant } from '../../design-system/components/Avatars/Avatar';
import Cell, { CellVariant } from '../../design-system/components/Cells/Cell';

// Internal dependencies
import { useSDK } from '@metamask/sdk-react';
import { Text } from 'react-native-paper';
import styles from './NetworkSelector.styles';

const t = require('node_modules/cryptocurrency-icons/svg/color/eth.svg');

export interface NetworkSelectorProps {
  showTestNetworks: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NetworkSelector = ({ showTestNetworks }: NetworkSelectorProps) => {
  const { chainId } = useSDK();

  const onNetworkChange = (type: string) => {
    console.log(`onNetworkChange: ${type}`);
  };

  const renderMainnet = () => {
    const mainnetName = 'Ethereum';
    return (
      <Cell
        variant={CellVariant.Select}
        title={mainnetName}
        avatarProps={{
          variant: AvatarVariant.Network,
          name: mainnetName,
          imageSource: t,
        }}
        isSelected={chainId === '0x1'}
        onPress={() => onNetworkChange(mainnetName)}
        style={styles.networkCell}
      />
    );
  };

  // const renderLineaMainnet = () => {
  //   const { name: lineaMainnetName, chainId } = Networks['linea-mainnet'];
  //   return (
  //     <Cell
  //       variant={CellVariant.Select}
  //       title={lineaMainnetName}
  //       avatarProps={{
  //         variant: AvatarVariant.Network,
  //         name: lineaMainnetName,
  //         imageSource: images['LINEA-MAINNET'],
  //       }}
  //       isSelected={chainId.toString() === providerConfig.chainId}
  //       onPress={() => onNetworkChange(LINEA_MAINNET)}
  //     />
  //   );
  // };

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
        {/* {renderLineaMainnet()}
        {renderRpcNetworks()} */}
        {/* {renderTestNetworksSwitch()} */}
        {/* {showTestNetworks && renderOtherNetworks()} */}
      </ScrollView>

      {/* <Button
        variant={ButtonVariants.Secondary}
        label={strings('app_settings.network_add_network')}
        onPress={goToNetworkSettings}
        width={ButtonWidthTypes.Full}
        size={ButtonSize.Lg}
        style={styles.addNetworkButton}
        {...generateTestId(Platform, ADD_NETWORK_BUTTON)}
      /> */}
    </View>
  );
};

export default NetworkSelector;
