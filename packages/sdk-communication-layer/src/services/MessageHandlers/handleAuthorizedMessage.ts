import { RemoteCommunication } from '../../RemoteCommunication';
import { EventType } from '../../types/EventType';

export function handleAuthorizedMessage(instance: RemoteCommunication) {
  instance.state.authorized = true;
  instance.emit(EventType.AUTHORIZED);
}
