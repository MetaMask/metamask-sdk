import React, { useCallback } from 'react';
import { EthereumRpcError } from 'eth-rpc-errors';

export const useHandleConnectEvent = (
  debug: boolean | undefined,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setChainId: React.Dispatch<React.SetStateAction<string | undefined>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
  chainId: string | undefined,
) => {
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
