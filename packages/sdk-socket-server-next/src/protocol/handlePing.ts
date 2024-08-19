import { Server, Socket } from 'socket.io';
import { validate } from 'uuid';
import { logger } from '../logger';
import { ClientType } from '../socket-config';
import { isDevelopment } from '../config';
import { retrieveMessages } from './retrieveMessages';

export type PingParams = {
  channelId: string;
  clientType: ClientType;
  socket: Socket;
  io: Server;
  callback: (error: string | null, result?: unknown) => void;
};

export const handlePing = async ({
  io,
  channelId,
  clientType,
  socket,
  callback,
}: PingParams) => {
  const socketId = socket.id;
  const clientIp = socket.request.socket.remoteAddress;

  if (!validate(channelId)) {
    logger.info(`ping ${channelId} invalid`, {
      id: channelId,
      clientIp,
      socketId,
    });
    return callback('error_id', undefined);
  }

  logger.info(`INFO> ping received channelId=${channelId}`);
  const room = io.sockets.adapter.rooms.get(channelId);
  // If the clientType socket is in the channel, retrieve messages
  const isSocketInRoom = room?.has(socketId) ?? false;

  if (!isSocketInRoom) {
    logger.error(
      `ERROR> PING ERROR > Socket not in room channelId=${channelId}`,
      {
        channelId,
        clientIp,
        socketId,
      },
    );
    return callback('error_socket_not_in_room', undefined);
  }

  if (clientType) {
    // Check for pending messages
    const messages = await retrieveMessages({ channelId, clientType });
    if (messages.length > 0) {
      logger.debug(
        `retrieveMessages ${channelId} clientType=${clientType} retrieved ${messages.length} messages`,
      );

      messages.forEach((msg) => {
        if (isDevelopment) {
          logger.debug(`emit message-${channelId}`, msg);
        }

        socket.emit(`message-${channelId}`, {
          id: channelId,
          ackId: msg.ackId,
          message: msg.message,
        });
      });
    }
  }

  try {
    socket.broadcast.to(channelId).emit(`ping-${channelId}`, { id: channelId });
  } catch (error) {
    logger.error(`ERROR> channelId=${channelId} Error on ping:`, error);
    // emit an error message back to the client, if appropriate
    socket.emit(`ping-${channelId}`, { error: (error as Error).message });
  }

  return true;
};
