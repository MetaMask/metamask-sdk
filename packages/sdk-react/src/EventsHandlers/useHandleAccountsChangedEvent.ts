import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';

export const useHandleAccountsChangedEvent = ({
  debug,
  setAccount,
  setConnected,
  setConnecting,
  setError,
}: EventHandlerProps) => {
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
      setConnecting(false);
      setError(undefined);
    },
    [debug, setAccount, setConnected, setError],
  );
};
