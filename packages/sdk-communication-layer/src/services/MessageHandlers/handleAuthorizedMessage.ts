import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { EventType } from '../../types/EventType';

export function handleAuthorizedMessage(
  state: RemoteCommunicationState,
  emit: EventEmitter2['emit'],
) {
  state.authorized = true;
  emit(EventType.AUTHORIZED);
}
