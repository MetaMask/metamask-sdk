import { RemoteCommunication } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';

export function handlePauseMessage(instance: RemoteCommunication) {
  instance.state.paused = true;
  instance.setConnectionStatus(ConnectionStatus.PAUSED);
}
