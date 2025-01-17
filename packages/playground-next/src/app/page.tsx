'use client';

import { useSDK } from '@metamask/sdk-react';
import styles from './page.module.css';
import { useState } from 'react';

interface AccountInfo {
  account: string;
  balance: string;
}

export default function Home() {
  const { sdk } = useSDK();
  const [account, setAccount] = useState<AccountInfo | null>(null);

  const connectWallet = async (): Promise<void> => {
    try {
      const accounts = await sdk?.connect();

      if (accounts?.[0]) {
        const provider = sdk?.getProvider();
        const balance = await provider?.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });

        setAccount({
          account: accounts[0],
          balance: balance ? (parseInt(balance as string, 16)).toString() : '0'
        });
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Simple Web3 Dapp</h1>

      {!account ? (
        <button className={styles.button} onClick={connectWallet}>
          Connect MetaMask
        </button>
      ) : (
        <>
          <div className={styles.address}>
            Address: {account.account}
          </div>
          <div className={styles.address}>
            Balance: {account.balance} Wei
          </div>
        </>
      )}
    </div>
  );
}
