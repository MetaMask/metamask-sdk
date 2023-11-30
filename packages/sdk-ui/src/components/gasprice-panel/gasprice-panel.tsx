import { useSDK } from '@metamask/sdk-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Text, { TextVariant } from '../../design-system/components/Texts/Text';
import { useTheme } from '../../theme';
import { Theme } from '../../theme/models';
import { AccountBalance } from '../metamask-button/account-balance/account-balance';

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
      gap: 10,
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    balanceContainer: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    segmentedButtons: {
      width: '100%',
    },
    actionContainer: {
      gap: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cryptoIcon: { width: 24, height: 24 },
  });

export interface GasPricePanelProps {}
export const GasPricePanel = ({}: GasPricePanelProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles({ theme }), [theme]);
  const { chainId } = useSDK();

  return (
    <View style={styles.container}>
      <Text variant={TextVariant.HeadingLG}>Gas Price</Text>
      <View style={styles.balanceContainer}>
        <Text>Balance</Text>
        <AccountBalance decimals={4} />
      </View>
      <Text>chain: {chainId}</Text>
      <Text>{t('TODO: implement infura gas price API')}</Text>
    </View>
  );
};
