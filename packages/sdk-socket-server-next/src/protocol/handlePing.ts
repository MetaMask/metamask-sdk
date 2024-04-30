import { Server, Socket } from 'socket.io';
import { validate } from 'uuid';
import { logger } from '../logger';

export type PingParams = {
  channelId: string;
  message: string;
  context: string;
  socket: Socket;
  io: Server;
  callback: (error: string | null, result?: unknown) => void;
};

export const handlePing = async ({
  channelId,
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

  logger.info('INFO> ping received', { channelId, clientIp, socketId });

  try {
    socket.broadcast.to(channelId).emit(`ping-${channelId}`, { id: channelId });
  } catch (error) {
    logger.error('ERROR> Error on ping:', error);
    // emit an error message back to the client, if appropriate
    socket.emit(`ping-${channelId}`, { error: (error as Error).message });
  }

  return true;
};
