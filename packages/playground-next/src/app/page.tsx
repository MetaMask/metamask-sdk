'use client';

import { useSDK } from '@metamask/sdk-react';
import styles from './page.module.css';
import { useCallback, useEffect, useState } from 'react';

interface AccountInfo {
  account: string;
  balance: string;
}

export default function Home() {
  const { sdk, connected, connecting, provider, account } = useSDK();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [signature, setSignature] = useState<string>('');
  const [signLoading, setSignLoading] = useState<boolean>(false);

  const getBalance = useCallback(async (address: string): Promise<string> => {
    const balance = await provider?.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    return balance ? parseInt(balance as string, 16).toString() : '0';
  }, [provider]);

  const connectWallet = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await sdk?.connect();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const terminateConnection = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await sdk?.terminate();
      setAccountInfo(null);
      setSignature('');
    } catch (err) {
      console.error('Failed to terminate connection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalSign = async (): Promise<void> => {
    if (!provider || !account) return;

    try {
      setSignLoading(true);
      const message = `Hello from MetaMask SDK! ${Date.now()}`;
      const hexMessage = `0x${Buffer.from(message).toString('hex')}`;

      const result = await provider.request({
        method: 'personal_sign',
        params: [hexMessage, account]
      });

      setSignature(result as string);
    } catch (err) {
      console.error('Personal sign failed:', err);
      setSignature('');
    } finally {
      setSignLoading(false);
    }
  };

  useEffect(() => {
    const updateAccountInfo = async () => {
      if (connected && account) {
        const balance = await getBalance(account);
        setAccountInfo({
          account,
          balance
        });
      } else {
        setAccountInfo(null);
      }
    };

    updateAccountInfo();
  }, [connected, account, provider, getBalance]);

  return (
    <div className={styles.container}>
      <h1>Simple Web3 Dapp</h1>

      {!connected ? (
        <button
          className={styles.button}
          onClick={connectWallet}
          disabled={isLoading || connecting}
        >
          {isLoading || connecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      ) : (
        <>
          <div className={styles.address}>
            Address: {accountInfo?.account}
          </div>
          <div className={styles.address}>
            Balance: {accountInfo?.balance} Wei
          </div>

          <button
            className={styles.button}
            onClick={handlePersonalSign}
            disabled={signLoading}
            style={{ marginBottom: '10px', marginTop: '10px' }}
          >
            {signLoading ? 'Signing...' : 'Personal Sign'}
          </button>

          {signature && (
            <div className={styles.address} style={{ wordBreak: 'break-all' }}>
              <strong>Signature:</strong> {signature}
            </div>
          )}

          <button
            className={styles.button}
            onClick={terminateConnection}
            disabled={isLoading}
          >
            {isLoading ? 'Terminating...' : 'Terminate Connection'}
          </button>
        </>
      )}
    </div>
  );
}
