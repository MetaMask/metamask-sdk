import {
  ConnectionStatus,
  ServiceStatus,
} from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../../sdk';
import { MetaMaskSDKEvent } from '../../../types/MetaMaskSDKEvents';

/**
 * Initializes event listeners for MetaMask SDK's remote connection.
 *
 * This function attaches listeners for CONNECTION_STATUS and SERVICE_STATUS events
 * on the remote connection's connector. These events are then emitted on the instance
 * itself, effectively propagating these events to whoever is using the instance.
 *
 * @param instance The MetaMaskSDK instance for which event listeners are being initialized.
 * @returns void
 */
export function initEventListeners(instance: MetaMaskSDK) {
  instance.remoteConnection
    ?.getConnector()
    ?.on(
      MetaMaskSDKEvent.ConnectionStatus,
      (connectionStatus: ConnectionStatus) => {
        instance.emit(MetaMaskSDKEvent.ConnectionStatus, connectionStatus);
      },
    );

  instance.remoteConnection
    ?.getConnector()
    ?.on(MetaMaskSDKEvent.ServiceStatus, (serviceStatus: ServiceStatus) => {
      instance.emit(MetaMaskSDKEvent.ServiceStatus, serviceStatus);
    });
}
