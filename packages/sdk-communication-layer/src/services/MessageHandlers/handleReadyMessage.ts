import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { EventType } from '../../types/EventType';
import { setConnectionStatus } from '../ConnectionManager';

export function handleReadyMessage(
  state: RemoteCommunicationState,
  emit: EventEmitter2['emit'],
) {
  setConnectionStatus(ConnectionStatus.LINKED, state, emit);

  // keep track of resumed state before resetting it and emitting messages
  // Better to reset the paused status before emitting as otherwise it may interfer.
  const resumed = state.paused;
  // Reset paused status
  state.paused = false;

  emit(EventType.CLIENTS_READY, {
    isOriginator: state.isOriginator,
    walletInfo: state.walletInfo,
  });

  if (resumed) {
    state.authorized = true;
    // If connection is resumed, automatically assume authorized.
    emit(EventType.AUTHORIZED);
  }
}
