import { useSDK } from '@metamask/sdk-react';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { getNetworkByHexChainId } from '../../../utils/networks';
import Text from '../../../design-system/components/Texts/Text';

export interface AccountBalanceProps {
  decimals?: number;
}
export const AccountBalance: React.FC<AccountBalanceProps> = ({
  decimals = 2,
}) => {
  const { balance, chainId } = useSDK();

  const network = useMemo(() => {
    return chainId ? getNetworkByHexChainId(chainId) : undefined;
  }, [chainId]);

  const formattedBalance = useMemo(() => {
    if (!balance) {
      return `0.${'0'.repeat(decimals)}`;
    }
    // Convert the hexadecimal balance to a decimal number
    const balanceInWei = parseInt(balance, 16);

    // Assuming the balance is in Wei (for Ethereum), convert it to Ether.
    // 1 Ether = 1e18 Wei
    const balanceInEther = balanceInWei / 1e18;

    // Format the number
    return balanceInEther.toFixed(decimals);
  }, [balance, decimals]);

  return (
    <View style={styles.container}>
      <Text ellipsizeMode="middle" numberOfLines={1}>
        {formattedBalance}
      </Text>
      <Text>{network?.symbol}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  formattedMarketValue: {
    fontWeight: 'bold',
    fontSize: 16, // Adjust as needed
  },
  balanceText: {
    fontSize: 14, // Adjust as needed
  },
  largeText: {
    fontSize: 18, // Adjust size for large variant
  },
});
