import { RemoteCommunication } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';

/**
 * Resumes the communication of a previously paused `RemoteCommunication`
 * This function primarily instructs the underlying communication layer to resume its activities. After resuming, the connection status of the instance is set to 'LINKED'.
 * Debug logs are generated if the debug state is enabled, indicating the current channel being resumed.
 *
 * @param instance The current instance of the RemoteCommunication class.
 */
export function resume(instance: RemoteCommunication) {
  const { communicationLayer, debug, channelId } = instance.state;
  if (debug) {
    console.debug(`RemoteCommunication::resume() channel=${channelId}`);
  }
  communicationLayer?.resume();
  instance.setConnectionStatus(ConnectionStatus.LINKED);
}
