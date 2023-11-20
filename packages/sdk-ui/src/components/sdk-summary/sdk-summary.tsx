import { SDKState, useSDK } from '@metamask/sdk-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Avatar, {
  AvatarAccountType,
  AvatarSize,
  AvatarVariant,
} from '../../design-system/components/Avatars/Avatar';
import Button, {
  ButtonSize,
  ButtonVariants,
} from '../../design-system/components/Buttons/Button';
import { IconName } from '../../design-system/components/Icons/Icon';
import Text from '../../design-system/components/Texts/Text';
import { AddressCopyButton } from '../address-copy-button/address-copy-button';
import NetworkSelector from '../network-selector/network-selector';
import { ActivityIndicator } from 'react-native-paper';

export interface SDKSummaryProps {
  _sdkState?: SDKState;
}
export const SDKSummary = ({ _sdkState }: SDKSummaryProps) => {
  const { t } = useTranslation('sdk-summary');
  const sdkState = useSDK();
  const { account, balance, balanceProcessing, chainId, provider, sdk } =
    _sdkState ?? sdkState;

  const handleNetworkChange = (newChainId: number) => {
    // make newChainId as 0x{string}
    const hexChainId = `0x${newChainId.toString(16)}`;
    provider?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar
          variant={AvatarVariant.Account}
          accountAddress={account ?? ''}
          type={AvatarAccountType.Blockies}
          size={AvatarSize.Md}
        />
        <AddressCopyButton address={account ?? ''} />
        <View style={styles.balanceContainer}>
          {balanceProcessing ? (
            <ActivityIndicator />
          ) : (
            <Text ellipsizeMode="middle" numberOfLines={1}>
              {balance}
            </Text>
          )}
          <Text>{chainId === '0x1' ? 'ETH' : '???'}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Button
            variant={ButtonVariants.Link}
            isDanger={false}
            size={ButtonSize.Lg}
            endIconName={IconName.Logout}
            onPress={() => sdk?.terminate()}
            label={t('Disconnect')}
          />
        </View>
      </View>

      {sdk && (
        <NetworkSelector
          showTestNetworks={true}
          onNetworkChange={handleNetworkChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    padding: 5,
    flexDirection: 'column',
    // flex: 1,
    paddingRight: 15,
    paddingLeft: 15,
    maxHeight: 400,
    gap: 15,
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    // flex: 1,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    // flex: 1,
    flexShrink: 1,
  },
  balanceContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    gap: 5,
    backgroundColor: '#E2E2E2',
  },
  icon: { padding: 5 },
  network: {},
  address: {},
});
