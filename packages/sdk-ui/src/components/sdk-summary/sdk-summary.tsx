import { useSDK } from '@metamask/sdk-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
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

export interface SDKSummaryProps {}
export const SDKSummary = () => {
  const { t } = useTranslation('sdk-summary');

  const { account, balance, connected, balanceProcessing, provider, sdk } =
    useSDK();

  const formattedBalance = useMemo(() => {
    if (!balance) {
      return '0.00';
    }
    // Convert the hexadecimal balance to a decimal number
    const balanceInWei = parseInt(balance, 16);

    // Assuming the balance is in Wei (for Ethereum), convert it to Ether.
    // 1 Ether = 1e18 Wei
    const balanceInEther = balanceInWei / 1e18;

    // Format the number to a string with two decimal places
    return balanceInEther.toFixed(2);
  }, [balance]);

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
              {formattedBalance}
            </Text>
          )}
          <Text>ETH</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Button
            variant={ButtonVariants.Link}
            isDanger={false}
            size={ButtonSize.Lg}
            startIconName={IconName.Logout}
            onPress={() => sdk?.terminate()}
            label={t('Disconnect')}
          />
        </View>
      </View>

      {connected && (
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
    width: '100%',
    padding: 5,
    flexDirection: 'column',
    // flex: 1,
    paddingRight: 15,
    paddingLeft: 15,
    maxHeight: 400,
    gap: 0,
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    gap: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {},
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
