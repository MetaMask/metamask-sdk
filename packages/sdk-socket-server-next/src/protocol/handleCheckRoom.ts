import { validate } from 'uuid';
import { Server, Socket } from 'socket.io';
import { getLogger } from '../logger';
import { pubClient } from '../api-config';

const logger = getLogger();

export type CheckRoomParams = {
  channelId: string;
  socket: Socket;
  io: Server;
  callback: (
    error: Error | null,
    result?: { occupancy: number; channelOccupancy?: string },
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
    logger.info(`[check_room] ${channelId} invalid`, {
      channelId,
      clientIp,
      socketId,
    });
    return callback(new Error('must specify a valid id'), undefined);
  }

  const room = io.sockets.adapter.rooms.get(channelId);
  const occupancy = room ? room.size : 0;
  const channelOccupancy =
    (await pubClient.hget('channels', channelId)) ?? undefined;

  logger.info(
    `[check_room] occupancy=${occupancy}, channelOccupancy=${channelOccupancy}`,
    { socketId, clientIp, channelId },
  );
  // Callback with null as the first argument, meaning "no error"
  return callback(null, { occupancy, channelOccupancy });
};
