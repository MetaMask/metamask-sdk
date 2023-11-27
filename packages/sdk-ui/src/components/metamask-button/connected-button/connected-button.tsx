import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Avatar, {
  AvatarAccountType,
  AvatarSize,
  AvatarVariant,
} from '../../../design-system/components/Avatars/Avatar';
import Text from '../../../design-system/components/Texts/Text';
import { AccountBalance } from '../account-balance/account-balance';

const textColor = 'black';

const styles = StyleSheet.create({
  container: {
    // padding: 5,
    flex: 1,
    gap: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    maxWidth: '99%',
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
  network: {
    fontWeight: 'bold',
    color: textColor,
  },
  address: {
    color: textColor,
  },
});

export interface ConnectedButtonProps {
  network: string;
  address: string;
  active?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const ConnectedButton = ({
  active,
  address,
  network,
  containerStyle,
}: ConnectedButtonProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Avatar
        variant={AvatarVariant.Account}
        accountAddress={address}
        type={AvatarAccountType.Blockies}
        size={AvatarSize.Md}
      />
      <View style={styles.content}>
        <Text style={styles.network}>{network}</Text>
        <Text ellipsizeMode="middle" numberOfLines={1} style={styles.address}>
          {address}
        </Text>
      </View>
      <AccountBalance decimals={2} withSymbol={false} />
      <MaterialIcons
        name={active ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
        size={24}
        color={textColor}
      />
    </View>
  );
};
