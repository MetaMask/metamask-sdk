import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { EventType } from '../../types/EventType';
import { disconnect } from '../ConnectionManager';

export function handleTerminateMessage(
  state: RemoteCommunicationState,
  emit: EventEmitter2['emit'],
) {
  // remove channel config from persistence layer and close active connections.
  if (state.isOriginator) {
    disconnect({
      options: { terminate: true, sendMessage: false },
      state,
      emit,
    });
    console.debug();
    emit(EventType.TERMINATE);
  }
}
