import { useSDK } from '@metamask/sdk-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import images from '../../../assets/images/image-icons';
import Button, {
  ButtonVariants,
} from '../../design-system/components/Buttons/Button';
import HelpText, {
  HelpTextSeverity,
} from '../../design-system/components/Form/HelpText';
import TextField from '../../design-system/components/Form/TextField';
import Text, { TextVariant } from '../../design-system/components/Texts/Text';
import { useTheme } from '../../theme';
import { Theme } from '../../theme/models';
import { getNetworkByHexChainId } from '../../utils/networks';
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

export interface SwapPanelProps {}
export const SwapPanel = ({}: SwapPanelProps) => {
  const { t } = useTranslation('sdk-summary');
  const theme = useTheme();
  const styles = useMemo(() => getStyles({ theme }), [theme]);
  const [amount, setAmount] = useState<number>(0);

  const { chainId, balance, provider } = useSDK();

  const [targetToken, setTargetToken] = useState('LINEA');

  const userBalance = useMemo(() => {
    if (!balance) {
      return 0;
    }

    // Convert the hexadecimal balance to a decimal number
    const balanceInWei = parseInt(balance, 16);

    // Assuming the balance is in Wei (for Ethereum), convert it to Ether.
    // 1 Ether = 1e18 Wei
    const balanceInEther = balanceInWei / 1e18;

    // Format the number
    return balanceInEther;
  }, [balance]);

  const error = useMemo(() => {
    return userBalance < amount || userBalance === 0;
  }, [userBalance, amount]);

  const network = useMemo(() => {
    return chainId ? getNetworkByHexChainId(chainId) : undefined;
  }, [chainId]);

  const renderIcon = (iconName: string) => (
    <Image
      style={styles.cryptoIcon}
      source={images[iconName as keyof typeof images]}
    />
  );

  const buttons = [
    {
      value: 'LINEA',
      icon: () => renderIcon('LINEA-MAINNET'),
      label: 'Linea ETH',
    },
    {
      value: 'Matic',
      icon: () => renderIcon('MATIC'),
      label: 'Polygon MATIC',
    },
  ];

  const handleAmountChange = (inputAmount: string) => {
    const fAmount = parseFloat(inputAmount);
    console.log(`new amount`, fAmount);
    setAmount(fAmount);
  };

  const handleBuyMore = useCallback(() => {
    provider?.request({
      method: 'metamask_open',
      params: [{ target: 'buy' }],
    });
  }, [provider]);

  const handleSwap = useCallback(() => {
    provider?.request({
      method: 'metamask_open',
      params: [{ target: 'swap', amount, token: targetToken }],
    });
  }, [provider, amount, targetToken]);

  return (
    <View style={styles.container}>
      <Text variant={TextVariant.HeadingLG}>SDK Quick SWAP</Text>
      <View style={styles.balanceContainer}>
        <Text>Balance</Text>
        <AccountBalance decimals={4} />
      </View>

      <TextField
        placeholder="Amount"
        onChangeText={handleAmountChange}
        endAccessory={<Text>{network?.symbol}</Text>}
      />

      {error && (
        <>
          <HelpText severity={HelpTextSeverity.Error}>
            {t('Insufficient balance')}
          </HelpText>
        </>
      )}
      <View>
        <Button
          variant={error ? ButtonVariants.Primary : ButtonVariants.Link}
          label={`Buy More ${network?.symbol}`}
          onPress={handleBuyMore}
        />
      </View>

      <SegmentedButtons
        value={targetToken}
        style={styles.segmentedButtons}
        onValueChange={setTargetToken}
        buttons={buttons}
      />
      <View style={styles.actionContainer}>
        <Button
          variant={error ? ButtonVariants.Secondary : ButtonVariants.Primary}
          label={'Swap Now'}
          // disabled={!!error}
          onPress={handleSwap}
        />
      </View>
    </View>
  );
};
