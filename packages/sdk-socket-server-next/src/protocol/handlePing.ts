import { Server, Socket } from 'socket.io';
import { validate } from 'uuid';
import { isDevelopment } from '../config';
import { getLogger } from '../logger';
import { ClientType } from '../socket-config';
import { retrieveMessages } from './retrieveMessages';

const logger = getLogger();

export type PingParams = {
  channelId: string;
  clientType: ClientType;
  socket: Socket;
  io: Server;
  callback: (error: string | null, result?: unknown) => void;
};

export const handlePing = async ({
  channelId,
  clientType,
  socket,
  callback,
}: PingParams) => {
  const socketId = socket.id;
  const clientIp = socket.request.socket.remoteAddress;

  if (!validate(channelId)) {
    logger.info(`[handlePing] ping ${channelId} invalid`, {
      id: channelId,
      clientIp,
      socketId,
    });
    return callback('error_id', undefined);
  }

  logger.info(
    `[handlePing] ping received channelId=${channelId} clientType=${clientType}`,
    {
      channelId,
      socketId,
      clientIp,
    },
  );

  if (clientType) {
    // Check for pending messages
    const messages = await retrieveMessages({ channelId, clientType });
    if (messages.length > 0) {
      logger.debug(
        `[handlePing] retrieveMessages ${channelId} clientType=${clientType} retrieved ${messages.length} messages`,
      );

      messages.forEach((msg) => {
        if (isDevelopment) {
          logger.debug(`[handlePing] emit message-${channelId}`, msg);
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
    logger.error(
      `[handlePing] ERROR> channelId=${channelId} Error on ping:`,
      error,
      {
        channelId,
        socketId,
        clientIp,
      },
    );
    // emit an error message back to the client, if appropriate
    socket.emit(`ping-${channelId}`, { error: (error as Error).message });
  }

  return true;
};
