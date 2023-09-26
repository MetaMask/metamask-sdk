import { EventType, ServiceStatus } from '@metamask/sdk';
import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';

export const useHandleSDKStatusEvent = ({
  debug,
  setStatus,
}: EventHandlerProps) => {
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
