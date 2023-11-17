import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Jazzicon from 'react-native-jazzicon';
import { Button, Text } from 'react-native-paper';
import { AddressCopyButton } from '../address-copy-button/address-copy-button';
import { SDKState, useSDK } from '@metamask/sdk-react';

export interface SDKSummaryProps {
  _sdkState?: SDKState;
}
export const SDKSummary = ({ _sdkState }: SDKSummaryProps) => {
  const { t } = useTranslation('sdk-summary');
  const sdkState = useSDK();
  const { account, balance, chainId, sdk } = _sdkState ?? sdkState;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Jazzicon size={32} address={account} />
        <AddressCopyButton address={account ?? ''} />
        <View style={styles.balanceContainer}>
          <Text ellipsizeMode="middle" numberOfLines={1}>
            {balance}
          </Text>
          <Text>{chainId === '0x1' ? 'ETH' : '???'}</Text>
        </View>
      </View>
      <Button mode="outlined" onPress={() => sdk?.terminate()}>
        {t('Disconnect')}
      </Button>
      <View>
        <Text>{t('Networks')}</Text>
      </View>
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
    padding: 10,
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
