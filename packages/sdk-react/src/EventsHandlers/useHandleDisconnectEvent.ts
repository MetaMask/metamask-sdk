import React, { useCallback } from 'react';
import { EthereumRpcError } from 'eth-rpc-errors';

export const useHandleDisconnectEvent = (
  debug: boolean | undefined,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
) => {
  return useCallback(
    (reason: unknown) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::provider on 'disconnect' event.`,
          reason,
        );
      }
      setConnecting(false);
      setConnected(false);
      setError(reason as EthereumRpcError<unknown>);
    },
    [debug, setConnecting, setConnected, setError],
  );
};
