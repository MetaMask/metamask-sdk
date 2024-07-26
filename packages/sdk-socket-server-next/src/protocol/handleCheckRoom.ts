import { validate } from 'uuid';
import { Server, Socket } from 'socket.io';
import { logger } from '../logger';
import { pubClient } from '../api-config';

export type CheckRoomParams = {
  channelId: string;
  socket: Socket;
  io: Server;
  callback: (
    error: Error | null,
    result?: { occupancy: number; channelOccupancy?: number },
  ) => void;
};

export const handleCheckRoom = async ({
  channelId,
  io,
  socket,
  callback,
}: CheckRoomParams) => {
  const socketId = socket.id;
  const clientIp = socket.request.socket.remoteAddress;

  if (!validate(channelId)) {
    logger.info(`check_room ${channelId} invalid`, {
      id: channelId,
      clientIp,
      socketId,
    });
    return callback(new Error('must specify a valid id'), undefined);
  }

  const room = io.sockets.adapter.rooms.get(channelId);
  const occupancy = room ? room.size : 0;

  const sRedisChannelOccupancy = await pubClient.hget('channels', channelId);
  const channelOccupancy = sRedisChannelOccupancy
    ? parseInt(sRedisChannelOccupancy, 10)
    : 0;

  logger.info(
    `check_room occupancy=${occupancy}, channelOccupancy=${channelOccupancy}`,
    { socketId, clientIp, id: channelId },
  );
  // Callback with null as the first argument, meaning "no error"
  return callback(null, { occupancy, channelOccupancy });
};
