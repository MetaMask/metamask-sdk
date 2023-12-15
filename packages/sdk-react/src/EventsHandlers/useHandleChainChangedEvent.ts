import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';

export const useHandleChainChangedEvent = ({
  debug,
  setChainId,
  setConnected,
  setConnecting,
  setError,
}: EventHandlerProps) => {
  return useCallback(
    (networkVersionOrChainId: any) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::provider on 'chainChanged' event.`,
          networkVersionOrChainId,
        );
      }
      // check if networkVersion has correct format
      if (
        typeof networkVersionOrChainId === 'object' &&
        networkVersionOrChainId?.chainId
      ) {
        setChainId(networkVersionOrChainId.chainId);
      } else {
        setChainId(networkVersionOrChainId);
      }

      setConnected(true);
      setConnecting(false);
      setError(undefined);
    },
    [debug, setChainId, setConnected, setError, setConnecting],
  );
};
