import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BalanceConversionText } from '../../components/balance-conversion-text/balance-conversion-text';
import { First } from '../../components/first/first';
import { IconOriginal } from '../../components/icons/IconOriginal';
import { IconWrongNetwork } from '../../components/icons/IconWrongNetwork';
import { IconSimplified } from '../../components/icons/IconsSimplified';
import { ItemView } from '../../components/item-view/item-view';
import { MetaMaskButton } from '../../components/metamask-button/metamask-button';
import { AddressCopyButton } from '../../components/address-copy-button/address-copy-button';
import Jazzicon from 'react-native-jazzicon';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // flexDirection: 'row',
    gap: 10,
    // backgroundColor: Colors.white,
  },
  componentContainer: {
    display: 'flex',
    gap: 10,
    padding: 20,
  },
});

export const DemoScreen = () => {
  return (
    <View style={{ width: '100%' }}>
      <Text>Testing UI cross platform components</Text>
      <View style={styles.container}>
        <View style={styles.componentContainer}>
          <First />
        </View>
        <View style={[styles.componentContainer, { backgroundColor: 'black' }]}>
          <IconSimplified color={'white'} />
          <IconSimplified color={'orange'} />
        </View>
        <View style={[styles.componentContainer]}>
          <IconOriginal />
        </View>
        <View style={styles.componentContainer}>
          <ItemView processing={true} label="label" value="value" />
        </View>
        <View style={styles.componentContainer}>
          <IconWrongNetwork />
        </View>
        <View style={styles.componentContainer}>
          <Jazzicon
            size={32}
            address={'0x2152220ab60719d6f987f6de1478971c585841c7'}
          />
        </View>
        <View>
          <AddressCopyButton address={'alalalal'} />
        </View>
        <View style={styles.componentContainer}>
          <BalanceConversionText
            formattedMarketValue="$76.18"
            balance="0.0482"
            symbol="ETH"
          />
          <BalanceConversionText
            formattedMarketValue="$76.18"
            balance="0.0482"
            symbol="ETH"
            variant="large"
          />
        </View>
        <View style={styles.componentContainer}>
          <MetaMaskButton
            icon="original"
            shape="rectangle"
            theme="light"
            color="white"
          />
        </View>
      </View>
    </View>
  );
};
