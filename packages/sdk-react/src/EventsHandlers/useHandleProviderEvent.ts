import React, { useCallback } from 'react';
import { EventType, PROVIDER_UPDATE_TYPE } from '@metamask/sdk';

export const useHandleProviderEvent = (
  debug: boolean | undefined,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setTrigger: React.Dispatch<React.SetStateAction<number>>,
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
      }
      setTrigger((_trigger) => _trigger + 1);
    },
    [debug, setConnecting, setTrigger],
  );
};
