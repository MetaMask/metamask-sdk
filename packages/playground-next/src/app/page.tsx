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
  const [rpcResponse, setRpcResponse] = useState<any>();
  const [rpcError, setRpcError] = useState<any>();

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
    } catch (err) {
      console.error('Failed to terminate connection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const personalSign = async (): Promise<void> => {
    if (!provider) {
      setRpcError('Provider not found');
      return;
    }

    try {
      const response = await provider?.request({
        method: 'personal_sign',
        params: ['Hello, world!', account]
      });
      setRpcResponse(response);
    } catch (error) {
      console.log('CAUGHT THIS ERROR: ', error);
      setRpcError(error);
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
      <h1>Playground-Next Dapp</h1>

      <h2>RPC Response</h2>
      <p>{JSON.stringify(rpcResponse)}</p>
      <h2>RPC Error</h2>
      <p>{JSON.stringify(rpcError)}</p>

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
            onClick={personalSign}
            disabled={isLoading}
          >
            Personal Sign
          </button>
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
