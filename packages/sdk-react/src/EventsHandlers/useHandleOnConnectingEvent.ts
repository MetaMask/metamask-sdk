import React, { useCallback } from 'react';
import { EthereumRpcError } from 'eth-rpc-errors';

export const useHandleOnConnectingEvent = (
  debug: boolean | undefined,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
) => {
  return useCallback(() => {
    if (debug) {
      console.debug(`MetaMaskProvider::provider on 'connecting' event.`);
    }
    setConnected(false);
    setConnecting(true);
    setError(undefined);
  }, [debug, setConnected, setConnecting, setError]);
};
