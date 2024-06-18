import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';
import { logger } from '../utils/logger';

export const useHandleConnectEvent = ({
  debug,
  setConnecting,
  setConnected,
  setChainId,
  setError,
  chainId,
}: EventHandlerProps) => {
  return useCallback(
    (connectParam: unknown) => {
      logger(
        `[MetaMaskProvider: useHandleConnectEvent()] on 'connect' event.`,
        connectParam,
      );

      const currentChainId = (connectParam as { chainId: string }).chainId;

      setConnecting(false);
      setConnected(true);
      setChainId(currentChainId);
      setError(undefined);
    },
    [debug, setConnecting, setConnected, setChainId, setError, chainId],
  );
};
