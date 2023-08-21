import { RemoteCommunication } from '../../RemoteCommunication';
import { EventType } from '../../types/EventType';

export function handleChannelCreatedEvent(instance: RemoteCommunication) {
  return (id: string) => {
    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication::${instance.state.context}::on 'channel_created' channelId=${id}`,
      );
    }
    instance.emit(EventType.CHANNEL_CREATED, id);
  };
}
