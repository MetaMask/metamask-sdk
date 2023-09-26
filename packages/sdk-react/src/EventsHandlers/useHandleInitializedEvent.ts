import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';

export const useHandleInitializedEvent = ({
  debug,
  setConnecting,
  setAccount,
  activeProvider,
  setConnected,
  setError,
}: EventHandlerProps) => {
  return useCallback(() => {
    if (debug) {
      console.debug(`MetaMaskProvider::provider on '_initialized' event.`);
    }
    setConnecting(false);
    setAccount(activeProvider?.selectedAddress || undefined);
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
