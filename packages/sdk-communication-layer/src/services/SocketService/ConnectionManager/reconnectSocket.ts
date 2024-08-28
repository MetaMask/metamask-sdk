// packages/sdk-communication-layer/src/services/SocketService/ConnectionManager/reconnectSocket.ts
import { MAX_RECONNECTION_ATTEMPS } from '../../../config';
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
  const { state } = instance;
  const { socket, channelId, context, isOriginator, isReconnecting } = state;

  if (isReconnecting) {
    logger.SocketService(
      `[SocketService: reconnectSocket()] Reconnection already in progress, skipping`,
      instance,
    );
    return false;
  }

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
  state.isReconnecting = true;
  state.reconnectionAttempts = 0;

  logger.SocketService(
    `[SocketService: reconnectSocket()] connected=${connected} trying to reconnect after socketio disconnection`,
    instance,
  );

  try {
    while (state.reconnectionAttempts < MAX_RECONNECTION_ATTEMPS) {
      logger.SocketService(
        `[SocketService: reconnectSocket()] Attempt ${
          state.reconnectionAttempts + 1
        } of ${MAX_RECONNECTION_ATTEMPS}`,
        instance,
      );

      // https://stackoverflow.com/questions/53297188/afnetworking-error-53-during-attempted-background-fetch
      await wait(200); // Delay to prevent IOS error

      if (socket.connected) {
        logger.SocketService(
          `Socket already connected --- ping to retrieve messages`,
        );

        socket.emit(MessageType.PING, {
          id: channelId,
          clientType: isOriginator ? 'dapp' : 'wallet',
          context: 'on_channel_config',
          message: '',
        });
        return true;
      }

      state.resumed = true;
      socket.connect();

      instance.emit(EventType.SOCKET_RECONNECT);

      try {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            EventType.JOIN_CHANNEL,
            {
              channelId,
              context: `${context}connect_again`,
              clientType: isOriginator ? 'dapp' : 'wallet',
            },
            async (
              error: string | null,
              result?: {
                ready: boolean;
                persistence?: boolean;
                walletKey?: string;
              },
            ) => {
              try {
                await handleJoinChannelResults(instance, error, result);
                resolve();
              } catch (runtimeError) {
                reject(runtimeError);
              }
            },
          );
        });

        // Add another delay to make sure connected state is available.
        await wait(100);
        if (socket.connected) {
          logger.SocketService(
            `Reconnection successful on attempt ${
              state.reconnectionAttempts + 1
            }`,
          );
          return true;
        }
      } catch (error) {
        logger.SocketService(
          `Error during reconnection attempt ${
            state.reconnectionAttempts + 1
          }:`,
          error,
        );
      }

      state.reconnectionAttempts += 1;
      if (state.reconnectionAttempts < MAX_RECONNECTION_ATTEMPS) {
        await wait(200);
      }
    }

    logger.SocketService(
      `Failed to reconnect after ${MAX_RECONNECTION_ATTEMPS} attempts`,
    );
    return false;
  } finally {
    state.isReconnecting = false;
    state.reconnectionAttempts = 0;
  }
};
