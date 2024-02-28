import { loggerServiceLayer } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { wait } from '../../../utils/wait';

/**
 * Attempts to reconnect the socket after a disconnection.
 * It first waits for a brief delay to prevent potential issues, then checks if the socket is not already connected.
 * If the socket is not connected, it sets the `resumed` state to true, reconnects the socket, and emits a SOCKET_RECONNECT event.
 * It also emits a JOIN_CHANNEL event to rejoin the channel.
 *
 * @param instance The current instance of the SocketService.
 */
export const reconnectSocket = async (instance: SocketService) => {
  loggerServiceLayer(
    `[SocketService: reconnectSocket()] instance.state.socket?.connected=${instance.state.socket?.connected} trying to reconnect after socketio disconnection`,
    instance,
  );

  // Add delay to prevent IOS error
  // https://stackoverflow.com/questions/53297188/afnetworking-error-53-during-attempted-background-fetch
  await wait(200);

  if (!instance.state.socket?.connected) {
    instance.state.resumed = true;
    instance.state.socket?.connect();

    instance.emit(EventType.SOCKET_RECONNECT);
    instance.state.socket?.emit(
      EventType.JOIN_CHANNEL,
      instance.state.channelId,
      `${instance.state.context}connect_again`,
    );
  }

  // wait again to make sure socket status is updated.
  await wait(100);
  return instance.state.socket?.connected;
};
