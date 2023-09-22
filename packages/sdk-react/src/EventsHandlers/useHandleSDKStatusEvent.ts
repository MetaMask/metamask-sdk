import React, { useCallback } from 'react';
import { EventType, ServiceStatus } from '@metamask/sdk';

export const useHandleSDKStatusEvent = (
  debug: boolean | undefined,
  setStatus: React.Dispatch<React.SetStateAction<ServiceStatus | undefined>>,
) => {
  return useCallback(
    (_serviceStatus: ServiceStatus) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::sdk on '${EventType.SERVICE_STATUS}/${_serviceStatus.connectionStatus}' event.`,
          _serviceStatus,
        );
      }
      setStatus(_serviceStatus);
    },
    [debug, setStatus],
  );
};
