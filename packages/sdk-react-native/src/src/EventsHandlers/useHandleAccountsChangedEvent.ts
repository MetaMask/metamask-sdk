import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';
import { logger } from '../utils/logger';

export const useHandleAccountsChangedEvent = ({
  debug,
  setAccount,
  setConnected,
  setConnecting,
  setError,
}: EventHandlerProps) => {
  return useCallback(
    (newAccounts: any) => {
      logger(
        `[MetaMaskProvider: useHandleAccountsChangedEvent()] on 'accountsChanged' event.`,
        newAccounts,
      );

      setAccount((newAccounts as string[])?.[0]);
      setConnected(true);
      setConnecting(false);
      setError(undefined);
    },
    [debug, setAccount, setConnected, setError],
  );
};
