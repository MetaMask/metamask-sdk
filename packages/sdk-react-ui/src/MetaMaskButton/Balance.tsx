import { useSDK } from '@metamask/sdk-react';
import React, { useMemo } from 'react';
import {
  useAccount,
  useBalance,
  useNetwork,
} from '../hooks/MetaMaskWagmiHooks';

const Balance = ({ theme }: { theme: string }) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data, isError, isLoading } = useBalance({
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

  // const balance = getBalance({ data, isError, isLoading });

  if (!balance || isLoading || isError) return null;

  return (
    <div
      className="tw-pl-4 tw-grid tw-content-center tw-justify-center tw-text-center"
      style={{ fontSize: 13 }}
    >
      <span
        className={`${
          theme === 'light' ? 'tw-bg-neutral-200' : 'tw-bg-neutral-400'
        } tw-p-1.5 tw-rounded`}
      >
        {formattedBalance}
      </span>
    </div>
  );
};

export default Balance;
