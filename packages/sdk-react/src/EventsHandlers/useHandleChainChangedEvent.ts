import React, { useCallback } from 'react';
import { EthereumRpcError } from 'eth-rpc-errors';

export const useHandleChainChangedEvent = (
  debug: boolean | undefined,
  setChainId: React.Dispatch<React.SetStateAction<string | undefined>>,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
) => {
  return useCallback(
    (networkVersion: any) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::provider on 'chainChanged' event.`,
          networkVersion,
        );
      }
      setChainId(
        (
          networkVersion as {
            chainId?: string;
            networkVersion?: string;
          }
        )?.chainId,
      );
      setConnected(true);
      setError(undefined);
    },
    [debug, setChainId, setConnected, setError],
  );
};
