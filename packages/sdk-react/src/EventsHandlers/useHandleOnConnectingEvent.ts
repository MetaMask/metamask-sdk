import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';

export const useHandleOnConnectingEvent = ({
  debug,
  setConnected,
  setConnecting,
  setError,
}: EventHandlerProps) => {
  return useCallback(() => {
    if (debug) {
      console.debug(`MetaMaskProvider::provider on 'connecting' event.`);
    }
    setConnected(false);
    setConnecting(true);
    setError(undefined);
  }, [debug, setConnected, setConnecting, setError]);
};
