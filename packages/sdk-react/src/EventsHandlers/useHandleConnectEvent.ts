import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';

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
      if (debug) {
        console.debug(
          `MetaMaskProvider::provider on 'connect' event.`,
          connectParam,
        );
      }
      const currentChainId = (connectParam as { chainId: string }).chainId;

      setConnecting(false);
      setConnected(true);
      setChainId(currentChainId);
      setError(undefined);
    },
    [debug, setConnecting, setConnected, setChainId, setError, chainId],
  );
};
