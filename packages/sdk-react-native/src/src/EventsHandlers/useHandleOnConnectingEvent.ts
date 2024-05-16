import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';
import { logger } from '../utils/logger';

export const useHandleOnConnectingEvent = ({
  debug,
  setConnected,
  setConnecting,
  setError,
}: EventHandlerProps) => {
  return useCallback(() => {
    logger(
      `[MetaMaskProvider: useHandleOnConnectingEvent()] on 'connecting' event.`,
    );

    setConnected(false);
    setConnecting(true);
    setError(undefined);
  }, [debug, setConnected, setConnecting, setError]);
};
