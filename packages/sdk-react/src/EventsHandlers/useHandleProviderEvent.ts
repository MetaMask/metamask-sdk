import React, { useCallback } from 'react';
import { EventType, PROVIDER_UPDATE_TYPE } from '@metamask/sdk';
import { EthereumRpcError } from 'eth-rpc-errors';

export const useHandleProviderEvent = (
  debug: boolean | undefined,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setTrigger: React.Dispatch<React.SetStateAction<number>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
) => {
  return useCallback(
    (type: PROVIDER_UPDATE_TYPE) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::sdk on '${EventType.PROVIDER_UPDATE}' event.`,
          type,
        );
      }
      if (type === PROVIDER_UPDATE_TYPE.TERMINATE) {
        setConnecting(false);
      } else if (type === PROVIDER_UPDATE_TYPE.EXTENSION) {
        setConnecting(false);
        setConnected(true);
        setError(undefined);
      }
      setTrigger((_trigger) => _trigger + 1);
    },
    [debug, setConnecting, setTrigger, setConnected, setError],
  );
};
