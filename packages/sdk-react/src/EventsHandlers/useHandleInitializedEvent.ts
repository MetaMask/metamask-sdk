import { SDKProvider } from '@metamask/sdk';
import { EthereumRpcError } from 'eth-rpc-errors';
import React, { useCallback } from 'react';

export const useHandleInitializedEvent = (
  debug: boolean | undefined,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setAccount: React.Dispatch<React.SetStateAction<string | undefined>>,
  activeProvider: SDKProvider | undefined,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
) => {
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
