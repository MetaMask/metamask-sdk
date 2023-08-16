import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { setConnectionStatus } from '../ConnectionManager';

export function handlePauseMessage(
  state: RemoteCommunicationState,
  emit: EventEmitter2['emit'],
) {
  state.paused = true;
  setConnectionStatus(ConnectionStatus.PAUSED, state, emit);
}
