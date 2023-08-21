import { RemoteCommunication } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';

export function resume(instance: RemoteCommunication) {
  if (instance.state.debug) {
    console.debug(
      `RemoteCommunication::resume() channel=${instance.state.channelId}`,
    );
  }
  instance.state.communicationLayer?.resume();
  instance.setConnectionStatus(ConnectionStatus.LINKED);
}
