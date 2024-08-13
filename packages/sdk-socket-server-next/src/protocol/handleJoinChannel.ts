import { Server, Socket } from 'socket.io';
import { validate } from 'uuid';
import { pubClient } from '../api-config';
import { MAX_CLIENTS_PER_ROOM, config } from '../config';
import { logger } from '../logger';
import { rateLimiter } from '../rate-limiter';
import { ClientType, MISSING_CONTEXT } from '../socket-config';
import { retrieveMessages } from './retrieveMessages';

export type JoinChannelParams = {
  io: Server;
  socket: Socket;
  channelId: string;
  clientType?: ClientType;
  context?: string;
  hasRateLimit: boolean;
  callback?: (error: string | null, result?: unknown) => void;
};

export type ChannelConfig = {
  clients: Record<ClientType, string>;
  persistence?: boolean; // Determines if the channel is compatible with full protocol persistence
  ready?: boolean; // Determines if the keys have been exchanged
  createdAt: number;
  updatedAt: number;
};

export const handleJoinChannel = async ({
  io,
  socket,
  channelId,
  context,
  clientType,
  hasRateLimit,
  callback,
}: JoinChannelParams) => {
  try {
    const socketId = socket.id;
    const clientIp = socket.request.socket.remoteAddress;

    let from = context ?? MISSING_CONTEXT;
    if (context?.indexOf('metamask-mobile') !== -1) {
      from = 'wallet';
    } else if (context?.indexOf('dapp') !== -1) {
      from = 'dapp';
    }

    logger.debug(
      `join_channel channelId=${channelId} context=${context} clientType=${clientType} callback=${typeof callback}`,
    );

    if (hasRateLimit) {
      try {
        await rateLimiter.consume(socket.handshake.address);
      } catch (e) {
        logger.error('Error while consuming rate limiter:', e);
        return;
      }
    }

    if (!validate(channelId)) {
      logger.error(`ERROR > join_channel ${channelId} invalid`);
      socket.emit(`message-${channelId}`, {
        error: 'must specify a valid id',
      });
      callback?.('error_id', undefined);
      return;
    }

    let channelConfig: ChannelConfig | null = null;

    if (clientType) {
      // New protocol when clientType is available
      const channelConfigKey = `channel_config:${channelId}`;
      const existingConfig = await pubClient.get(channelConfigKey);
      channelConfig = existingConfig ? JSON.parse(existingConfig) : null;

      if (clientType === 'dapp' && !existingConfig) {
        // Initialize new config for this channel
        logger.info(`Creating new channel config for ${channelId}`);
        const now = Date.now();
        channelConfig = {
          clients: {
            dapp: socketId,
          } as Record<ClientType, string>,
          createdAt: now,
          updatedAt: now,
        };
      }

      if (channelConfig) {
        channelConfig.clients[clientType] = socketId;
        const persistence = Object.keys(channelConfig.clients).length === 2;
        channelConfig.persistence = persistence;
        channelConfig.updatedAt = Date.now();
        logger.info(
          `join_channel ${channelId} clientType=${clientType} persistence=${persistence}`,
          JSON.stringify(channelConfig),
        );

        await pubClient.setex(
          channelConfigKey,
          config.channelExpiry,
          JSON.stringify(channelConfig),
        ); // 1 week expiration
      }
    }

    const sRedisChannelOccupancy = await pubClient.hget('channels', channelId);
    let channelOccupancy = 0;
    const now = Date.now();

    logger.debug(
      `join_channel from=${from} ${channelId} context=${context} clientType=${clientType} occupancy=${sRedisChannelOccupancy}`,
    );

    if (sRedisChannelOccupancy) {
      const channelData = JSON.parse(sRedisChannelOccupancy);
      channelOccupancy = channelData.occupancy;
    } else {
      logger.debug(
        `join_channel ${channelId} from ${socketId} -- room not found -- creating it now`,
      );

      await pubClient.hset(
        'channels',
        channelId,
        JSON.stringify({ occupancy: 0, timestamp: now }),
      );
      await pubClient.expire('channels', config.channelExpiry); // Set TTL for the hash
    }

    // room should be < MAX_CLIENTS_PER_ROOM since we haven't joined yet
    const room = io.sockets.adapter.rooms.get(channelId);
    // roomOccupancy can potentially be 0 instead of 1 if the dapp and wallet were dispatched on different servers
    // channelOccupancy should be the correct value as it represents the global state accross all servers
    let roomOccupancy = room?.size ?? 0;

    const isSocketInRoom = room?.has(socketId) ?? false;
    if (isSocketInRoom) {
      logger.warn(`Socket ${socketId} already in room ${channelId} `);
    } else {
      // Join and get the number of clients in the room
      await socket.join(channelId);
    }

    // // room occupancy is the number of clients in the room on this server
    // if (roomOccupancy > MAX_CLIENTS_PER_ROOM) {
    //   logger.warn(`join_channel from=${from} ${channelId} room already full`);
    //   socket.emit(`message-${channelId}`, { error: 'room already full' });
    //   return;
    // }

    // // channel occupancy is the number of clients in the room across all servers
    // if (channelOccupancy > MAX_CLIENTS_PER_ROOM) {
    //   logger.warn(
    //     `join_channel from=${from} ${channelId} redis channel appears full`,
    //   );
    //   socket.emit(`message-${channelId}`, { error: 'room already full' });
    //   return;
    // }

    if (sRedisChannelOccupancy) {
      try {
        channelOccupancy = JSON.parse(sRedisChannelOccupancy).occupancy;
      } catch (error) {
        channelOccupancy = parseInt(sRedisChannelOccupancy, 10) || 1;
      }
    }

    //  Refresh the room occupancy -it should now matches channel occupancy
    roomOccupancy = io.sockets.adapter.rooms.get(channelId)?.size ?? 0;

    // Update the hash with the new occupancy and timestamp
    await pubClient.hset(
      'channels',
      channelId,
      JSON.stringify({ occupancy: channelOccupancy, timestamp: now }),
    );

    // There may be -1 discrepency between room and channel occupancy depending if they are connected on the same server or not
    if (channelOccupancy - roomOccupancy > 1 || channelOccupancy < 0) {
      // Send warning if anything different than allowed discrepancy
      logger.warn(
        `INVALID occupancy room=${roomOccupancy} channel=${channelOccupancy}`,
      );
    }

    logger.info(
      `join_channel from=${from} ${channelId}, ready=${channelConfig?.ready} persistence=${channelConfig?.persistence} Occupancy: ${channelOccupancy}`,
      {
        id: channelId,
        socketId,
        clientIp,
        roomOccupancy,
        channelOccupancy,
      },
    );

    if (!clientType && channelOccupancy < MAX_CLIENTS_PER_ROOM) {
      logger.debug(
        `emit clients_waiting_to_join-${channelId} - channelCount = ${channelOccupancy}`,
      );

      socket.emit(`clients_waiting_to_join-${channelId}`, channelOccupancy);
      return;
    }

    socket.on('disconnect', async (error) => {
      logger.info(`disconnect event from=${from} room ${channelId} ${error}`, {
        id: channelId,
        socketId,
        clientIp,
      });

      // Inform the room of the disconnection
      socket.broadcast
        .to(channelId)
        .emit(`clients_disconnected-${channelId}`, error);
    });

    if (channelOccupancy >= MAX_CLIENTS_PER_ROOM - 1) {
      logger.info(`emitting clients_connected-${channelId}`, channelId);

      // imform all clients of new arrival and that room is ready
      socket.broadcast
        .to(channelId)
        .emit(`clients_connected-${channelId}`, channelId);
      socket.emit(`clients_connected-${channelId}`, channelId);
    }

    if (channelConfig?.ready && clientType) {
      callback?.(null, {
        ready: channelConfig?.ready,
        persistence: channelConfig?.persistence,
      });

      setTimeout(async () => {
        try {
          const messages = await retrieveMessages({ channelId, clientType });
          console.log(
            `join_channel ${channelId} clientType=${clientType} retrieved messages`,
            JSON.stringify(messages, null, 2),
          );

          messages.forEach((msg) => {
            socket.emit(`message-${channelId}`, {
              id: channelId,
              ackId: msg.ackId,
              message: msg.message,
            });
          });
        } catch (error) {
          logger.error(`Error retrieving messages: ${error}`);
        }
      }, 1000);
    }
  } catch (error) {
    logger.error(`Error in handleJoinChannel: ${error}`);
  }
};
