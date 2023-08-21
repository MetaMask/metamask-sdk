import { RemoteCommunication } from '../../RemoteCommunication';

export function handleSocketDisconnectedEvent(instance: RemoteCommunication) {
  return () => {
    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication::on 'socket_Disconnected' set ready to false`,
      );
    }
    instance.state.ready = false;
  };
}
