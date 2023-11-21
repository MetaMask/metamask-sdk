import { useSDK } from '@metamask/sdk-react';
import React from 'react';
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
import { AddressCopyButton } from '../address-copy-button/address-copy-button';
import { AccountBalance } from '../metamask-button/account-balance/account-balance';
import NetworkSelector from '../network-selector/network-selector';

export interface SDKSummaryProps {}
export const SDKSummary = () => {
  const { t } = useTranslation('sdk-summary');

  const { account, connected, balanceProcessing, sdk } = useSDK();

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
            <AccountBalance decimals={4} />
          )}
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

      {connected && <NetworkSelector showTestNetworks={true} />}
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
