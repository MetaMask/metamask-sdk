import { EventType, ServiceStatus } from "@metamask/sdk";

export function handleSDKStatusEvent(debug: boolean | undefined, setStatus: React.Dispatch<React.SetStateAction<ServiceStatus | undefined>>) {
  return (_serviceStatus: ServiceStatus) => {
    if (debug) {
      console.debug(
        `MetaMaskProvider::sdk on '${EventType.SERVICE_STATUS}/${_serviceStatus.connectionStatus}' event.`,
        _serviceStatus
      );
    }
    setStatus(_serviceStatus);
  };
}
