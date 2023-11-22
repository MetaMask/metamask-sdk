import React from 'react';
import { StyleSheet, View } from 'react-native';
import Jazzicon from 'react-native-jazzicon';
import { Text } from 'react-native-paper';
import images from '../../../assets/images/image-icons';
import { AddressCopyButton } from '../../components/address-copy-button/address-copy-button';
import { BalanceConversionText } from '../../components/balance-conversion-text/balance-conversion-text';
import { IconOriginal } from '../../components/icons/IconOriginal';
import { IconWrongNetwork } from '../../components/icons/IconWrongNetwork';
import { IconSimplified } from '../../components/icons/IconsSimplified';
import { ItemView } from '../../components/item-view/item-view';
import { MetaMaskButton } from '../../components/metamask-button/metamask-button';
import { AvatarSize } from '../../design-system/components/Avatars/Avatar';
import { ICON_SIZE_BY_AVATAR_SIZE } from '../../design-system/components/Avatars/Avatar/variants/AvatarFavicon/AvatarFavicon.constants';
import { BadgeVariant } from '../../design-system/components/Badges/Badge';
import BadgeNetwork from '../../design-system/components/Badges/Badge/variants/BadgeNetwork';
import Button, {
  ButtonVariants,
} from '../../design-system/components/Buttons/Button';
import Icon, { IconName } from '../../design-system/components/Icons/Icon';
import NetworkSelector from '../../components/network-selector/network-selector';
import { useSDK } from '@metamask/sdk-react';
import { Image } from '../../design-system/components/NextImage/NextImage';

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

console.log(`images`, images);

export const PreviewScreen = () => {
  const { sdk } = useSDK();

  return (
    <View style={{ width: '100%' }}>
      <Text>Testing UI cross platform components</Text>
      <View style={styles.container}>
        <View style={styles.componentContainer}>
          {sdk && <NetworkSelector showTestNetworks={true} />}
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
          <Text>Here is ethIcon</Text>
          <Image
            style={{ width: 50, height: 50, borderWidth: 1 }}
            source={images.ETHEREUM}
          />
          <BadgeNetwork
            variant={BadgeVariant.Network}
            style={{ width: 50, height: 50, borderWidth: 1 }}
            name="Ethereum"
            imageSource={{
              uri: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
            }}
          />
          <Text>Here is icon</Text>
          <Icon
            size={ICON_SIZE_BY_AVATAR_SIZE[AvatarSize.Md]}
            name={IconName.Add}
          />
          <Text>Here is linea</Text>
          <Image
            style={{ width: 50, height: 50 }}
            source={images['LINEA-MAINNET']}
          />
          <Text>After Linea</Text>
          <Button
            label="test"
            variant={ButtonVariants.Primary}
            onPress={() => false}
          />
          <Text>{ButtonVariants.Primary}</Text>
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
