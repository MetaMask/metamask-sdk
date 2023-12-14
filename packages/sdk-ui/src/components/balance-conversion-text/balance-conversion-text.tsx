import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BalanceConversionTextProps {
  /** Fiat currency value */
  formattedMarketValue: string;
  /** Token balance */
  balance: string;
  /** Token symbol */
  symbol: string;
  /** Determines font size and style */
  variant?: 'default' | 'large';
}

export const BalanceConversionText: React.FC<BalanceConversionTextProps> = ({
  formattedMarketValue,
  balance,
  symbol,
  variant = 'default',
}) => {
  // const { colors } = useTheme();
  const colors = { text: 'black' };

  return (
    <View style={styles.container}>
      <Text style={[styles.formattedMarketValue, { color: colors.text }]}>
        {formattedMarketValue}
      </Text>
      <Text
        style={[
          styles.balanceText,
          variant === 'large' ? styles.largeText : null,
          { color: colors.text },
        ]}
      >
        {balance} {symbol}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
