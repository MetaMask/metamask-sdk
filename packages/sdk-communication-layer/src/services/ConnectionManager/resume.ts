import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { setConnectionStatus } from './setConnectionStatus';

export function resume(
  state: RemoteCommunicationState,
  emit: EventEmitter2['emit'],
) {
  if (state.debug) {
    console.debug(`RemoteCommunication::resume() channel=${state.channelId}`);
  }
  state.communicationLayer?.resume();
  setConnectionStatus(ConnectionStatus.LINKED, state, emit);
}
