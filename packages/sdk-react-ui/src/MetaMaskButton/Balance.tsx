import React from 'react';
import { useNetwork, useAccount, useBalance } from '../hooks/MetaMaskWagmiHooks';
import { getBalance } from './utils';

const Balance = ({ theme }: { theme: string }) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data, isError, isLoading } = useBalance({
    address: address,
    chainId: chain?.id,
    enabled: isConnected,
  });

  const balance = getBalance({ data, isError, isLoading });

  if (!balance || isLoading || isError) return null;

  return (
    <div
      className="pl-4 grid content-center justify-center text-center"
      style={{ fontSize: 13 }}
    >
      <span
        className={`${
          theme === 'light' ? 'bg-neutral-200' : 'bg-neutral-400'
        } p-1.5 rounded`}
      >
        {balance}
      </span>
    </div>
  );
};

export default Balance;
