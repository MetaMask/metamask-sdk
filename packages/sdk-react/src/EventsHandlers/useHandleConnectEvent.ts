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
      setConnecting(false);
      setConnected(true);
      setChainId((connectParam as { chainId: string })?.chainId);
      setError(undefined);
      if (chainId) {
        setChainId(chainId);
      }
    },
    [debug, setConnecting, setConnected, setChainId, setError, chainId],
  );
};
