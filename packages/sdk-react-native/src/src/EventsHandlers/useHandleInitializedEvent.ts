import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';
import { logger } from '../utils/logger';

export const useHandleInitializedEvent = ({
  debug,
  setConnecting,
  setAccount,
  activeProvider,
  setConnected,
  setError,
}: EventHandlerProps) => {
  return useCallback(() => {
    logger(
      `[MetaMaskProvider: useHandleInitializedEvent()] on '_initialized' event.`,
    );

    setConnecting(false);
    setConnected(true);
    setError(undefined);
  }, [
    debug,
    setConnecting,
    setAccount,
    activeProvider,
    setConnected,
    setError,
  ]);
};
