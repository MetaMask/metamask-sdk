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

      try {
        // Force trigger rendering
        const temp = JSON.parse(JSON.stringify(_serviceStatus ?? {}));
        setStatus(temp);
      } catch(err) {
        console.error(err);
      }
    },
    [debug, setStatus],
  );
};
