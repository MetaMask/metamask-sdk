import { RemoteCommunication } from '../../RemoteCommunication';
import { clean } from '../ChannelManager';

export function handleSocketReconnectEvent(instance: RemoteCommunication) {
  return () => {
    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication::on 'socket_reconnect' -- reset key exchange status / set ready to false`,
      );
    }
    instance.state.ready = false;
    clean(instance.state);
  };
}
