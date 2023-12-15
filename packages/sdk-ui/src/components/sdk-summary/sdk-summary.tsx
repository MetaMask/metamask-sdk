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
import { useTheme } from '../../theme';
import { Theme } from '../../theme/models';
import { AddressCopyButton } from '../address-copy-button/address-copy-button';
import { AccountBalance } from '../metamask-button/account-balance/account-balance';
import NetworkSelector from '../network-selector/network-selector';

const getStyles = ({}: { theme: Theme }) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      width: '100%',
      flex: 1,
      padding: 5,
      flexDirection: 'column',
      paddingRight: 15,
      paddingLeft: 15,
      gap: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      width: '100%',
      gap: 0,
      height: 160,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerContent: {},
    balanceContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: { padding: 5 },
    network: {},
    address: {},
  });

export interface SDKSummaryProps {}
export const SDKSummary = ({}: SDKSummaryProps) => {
  const { t } = useTranslation('sdk-summary');
  const theme = useTheme();
  const styles = useMemo(() => getStyles({ theme }), [theme]);

  const { account, connected, balanceProcessing, sdk } = useSDK();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar
          variant={AvatarVariant.Account}
          accountAddress={account ?? ''}
          type={AvatarAccountType.Blockies}
          size={AvatarSize.Xl}
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
