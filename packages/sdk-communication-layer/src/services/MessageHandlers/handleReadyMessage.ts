import { RemoteCommunication } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { EventType } from '../../types/EventType';

export function handleReadyMessage(instance: RemoteCommunication) {
  instance.setConnectionStatus(ConnectionStatus.LINKED);

  // keep track of resumed state before resetting it and emitting messages
  // Better to reset the paused status before emitting as otherwise it may interfer.
  const resumed = instance.state.paused;
  // Reset paused status
  instance.state.paused = false;

  instance.emit(EventType.CLIENTS_READY, {
    isOriginator: instance.state.isOriginator,
    walletInfo: instance.state.walletInfo,
  });

  if (resumed) {
    instance.state.authorized = true;
    // If connection is resumed, automatically assume authorized.
    instance.emit(EventType.AUTHORIZED);
  }
}
