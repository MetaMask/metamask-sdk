import { RemoteCommunication } from '../../RemoteCommunication';
import { EventType } from '../../types/EventType';
import { disconnect } from '../ConnectionManager';

export function handleTerminateMessage(instance: RemoteCommunication) {
  // remove channel config from persistence layer and close active connections.
  if (instance.state.isOriginator) {
    disconnect({
      options: { terminate: true, sendMessage: false },
      instance,
    });
    console.debug();
    instance.emit(EventType.TERMINATE);
  }
}
