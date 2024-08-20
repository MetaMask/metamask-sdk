// packages/sdk-communication-layer/src/services/SocketService/ConnectionManager/reconnectSocket.ts
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';
import { wait } from '../../../utils/wait';
import { handleJoinChannelResults } from './handleJoinChannelResult';

/**
 * Attempts to reconnect the socket after a disconnection.
 * It first waits for a brief delay to prevent potential issues, then checks if the socket is not already connected.
 * If the socket is not connected, it sets the `resumed` state to true, reconnects the socket, and emits a SOCKET_RECONNECT event.
 * It also emits a JOIN_CHANNEL event to rejoin the channel.
 *
 * @param instance The current instance of the SocketService.
 */
export const reconnectSocket = async (instance: SocketService) => {
  const { remote, state } = instance;
  const { terminated } = remote.state;
  const { socket, channelId, context, isOriginator } = state;

  if (!socket) {
    logger.SocketService(
      `[SocketService: reconnectSocket()] socket is not defined`,
      instance,
    );
    return false;
  }

  if (!channelId) {
    // ignore reconnect if channelId is not defined
    return false;
  }

  const { connected } = socket;
  if (terminated) {
    logger.SocketService(
      `[SocketService: reconnectSocket()] terminated=${terminated} socket already terminated`,
      instance,
    );
    return false;
  }

  logger.SocketService(
    `[SocketService: reconnectSocket()] connected=${connected} trying to reconnect after socketio disconnection`,
    instance,
  );

  // Add delay to prevent IOS error
  // https://stackoverflow.com/questions/53297188/afnetworking-error-53-during-attempted-background-fetch
  await wait(200);

  if (connected) {
    logger.SocketService(
      `Socket already connected --- ping to retrive messages`,
    );

    socket.emit(MessageType.PING, {
      id: channelId,
      clientType: isOriginator ? 'dapp' : 'wallet',
      context: 'on_channel_config',
      message: '',
    });
  } else {
    // Use a temporary variable to avoid the race condition
    state.resumed = true;
    socket.connect();

    instance.emit(EventType.SOCKET_RECONNECT);
    socket.emit(
      EventType.JOIN_CHANNEL,
      {
        channelId,
        context: `${context}connect_again`,
        clientType: isOriginator ? 'dapp' : 'wallet',
      },
      async (
        error: string | null,
        result?: { ready: boolean; persistence?: boolean; walletKey?: string },
      ) => {
        try {
          await handleJoinChannelResults(instance, error, result);
        } catch (runtimeError) {
          console.warn(`Error reconnecting to channel`, runtimeError);
        }
      },
    );
  }

  await wait(100);
  return socket.connected;
};
