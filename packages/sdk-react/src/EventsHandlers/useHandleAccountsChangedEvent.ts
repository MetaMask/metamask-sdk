import React, { useCallback } from 'react';
import { EthereumRpcError } from 'eth-rpc-errors';

export const useHandleAccountsChangedEvent = (
  debug: boolean | undefined,
  setAccount: React.Dispatch<React.SetStateAction<string | undefined>>,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
) => {
  return useCallback(
    (newAccounts: any) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::provider on 'accountsChanged' event.`,
          newAccounts,
        );
      }
      setAccount((newAccounts as string[])?.[0]);
      setConnected(true);
      setError(undefined);
    },
    [debug, setAccount, setConnected, setError],
  );
};
