import { EthereumRpcError } from 'eth-rpc-errors';
import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';
import { logger } from '../utils/logger';

export const useHandleDisconnectEvent = ({
  debug,
  setConnecting,
  setConnected,
  setError,
}: EventHandlerProps) => {
  return useCallback(
    (reason: unknown) => {
      logger(
        `[MetaMaskProvider: useHandleDisconnectEvent()] on 'disconnect' event.`,
        reason,
      );

      setConnecting(false);
      setConnected(false);
      setError(reason as EthereumRpcError<unknown>);
    },
    [debug, setConnecting, setConnected, setError],
  );
};
