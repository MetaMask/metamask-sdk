import React, { useCallback } from 'react';
import { EthereumRpcError } from 'eth-rpc-errors';

export const useHandleChainChangedEvent = (
  debug: boolean | undefined,
  setChainId: React.Dispatch<React.SetStateAction<string | undefined>>,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
) => {
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
