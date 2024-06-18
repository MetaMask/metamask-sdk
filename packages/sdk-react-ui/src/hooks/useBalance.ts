import { useMemo } from 'react';
import {
  useAccount,
  useBalance as useBalanceWagmi,
  useNetwork,
} from './MetaMaskWagmiHooks';
import { useSDK } from '@metamask/sdk-react';

function useBalance() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const { isError, isLoading, data } = useBalanceWagmi({
    address: address,
    chainId: chain?.id,
    enabled: isConnected,
  });

  const { balance } = useSDK();

  const decimals = 2;

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

  return { balance, formattedBalance, isLoading, isError, symbol: data?.symbol };
}

export default useBalance;
