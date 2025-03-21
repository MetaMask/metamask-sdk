// protocol/handleJoinChannel.ts
import { Server, Socket } from 'socket.io';
import { validate } from 'uuid';
import { pubClient, pubClientPool } from '../analytics-api';
import { MAX_CLIENTS_PER_ROOM, config, isDevelopment } from '../config';
import { getLogger } from '../logger';
import { rateLimiter } from '../rate-limiter';
import { ClientType, MISSING_CONTEXT } from '../socket-config';
import { retrieveMessages } from './retrieveMessages';

const logger = getLogger();

const checkMessage = ({
  clientType,
  channelId,
  socket,
}: {
  clientType: ClientType;
  channelId: string;
  socket: Socket;
}) => {
  setTimeout(async () => {
    try {
      const messages = await retrieveMessages({ channelId, clientType });
      logger.debug(
        `[checkMessage] ${channelId} clientType=${clientType} retrieved ${messages.length} messages`,
      );

      messages.forEach((msg) => {
        if (isDevelopment) {
          logger.debug(`emit message-${channelId}`, msg);
        }

        socket.emit(`message-${channelId}`, {
          channelId,
          id: channelId,
          ackId: msg.ackId,
          message: msg.message,
        });
      });
    } catch (error) {
      logger.error(`Error retrieving messages: ${error}`);
    }
  }, 1000);

  return true;
};

export type JoinChannelParams = {
  io: Server;
  socket: Socket;
  channelId: string;
  clientType?: ClientType;
  publicKey?: string;
  context?: string;
  hasRateLimit: boolean;
  callback?: (error: string | null, result?: unknown) => void;
};

export type ChannelConfig = {
  clients: Record<ClientType, string>; // 'dapp' | 'wallet';
  persistence?: boolean; // Determines if the channel is compatible with full protocol persistence
  ready?: boolean; // Determines if the keys have been exchanged
  walletKey?: string; // Wallet public key
  rejected?: boolean; // Determines if the channel has been rejected
  createdAt: number;
  updatedAt: number;
};

export const handleJoinChannel = async ({
  io,
  socket,
  channelId,
  context,
  clientType,
  publicKey,
  hasRateLimit,
  callback,
}: JoinChannelParams) => {
  const socketId = socket.id;
  const clientIp = socket.request.socket.remoteAddress;
  try {
    let from = context ?? MISSING_CONTEXT;
    if (context?.indexOf('metamask-mobile') !== -1) {
      from = 'wallet';
    } else if (context?.indexOf('dapp') !== -1) {
      from = 'dapp';
    }

    logger.debug(
      `[handleJoinChannel] channelId=${channelId} context=${context} clientType=${clientType} publicKey=${publicKey} callback=${typeof callback}`,
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
      logger.error(`[handleJoinChannel] ${channelId} invalid`, {
        channelId,
        socketId,
        clientIp,
      });

      socket.emit(`message-${channelId}`, {
        error: 'must specify a valid id',
      });
      callback?.('error_id', undefined);
      return;
    }

    let channelConfig: ChannelConfig | null = null;
    // Force keys into the same hash slot in Redis Cluster, using a hash tag (a substring enclosed in curly braces {})
    const channelOccupancyKey = `channel_occupancy:{${channelId}}`;

    if (clientType) {
      // New protocol when clientType is available
      const channelConfigKey = `channel_config:{${channelId}}`;
      const existingConfig = await pubClient.get(channelConfigKey);
      channelConfig = existingConfig ? JSON.parse(existingConfig) : null;
      const now = Date.now();

      if (!channelConfig) {
        logger.info(
          `[handleJoinChannel] Creating new channel config for ${channelId}`,
          {
            channelId,
            socketId,
            clientIp,
          },
        );

        // Initialize new config for this channel
        channelConfig = {
          clients: {
            [clientType]: socketId,
          } as Record<ClientType, string>,
          walletKey: publicKey,
          createdAt: now,
          updatedAt: now,
        };
      }

      if (channelConfig) {
        // check if connection was rejected
        if (channelConfig.rejected) {
          logger.info(
            `[handleJoinChannel] ${channelId} walletKey=${publicKey} connection was rejected`,
          );

          callback?.(null, {
            rejected: channelConfig.rejected,
          });
          return;
        }

        channelConfig.clients[clientType] = socketId;
        const persistence = Object.keys(channelConfig.clients).length === 2;
        channelConfig.persistence = persistence;
        channelConfig.updatedAt = Date.now();
        if (publicKey && !channelConfig.walletKey) {
          channelConfig.walletKey = publicKey;

          logger.info(
            `[handleJoinChannel] ${channelId} walletKey=${publicKey} inform dapp config`,
          );

          // if channelConfig is received, we inform dApp
          socket.broadcast.to(channelId).emit(`config-${channelId}`, {
            walletKey: publicKey,
            persistence,
          });
        }

        logger.info(
          `[handleJoinChannel] ${channelId} clientType=${clientType} persistence=${persistence}`,
          JSON.stringify(channelConfig),
        );

        const client = await pubClientPool.acquire();

        await client.setex(
          channelConfigKey,
          config.channelExpiry,
          JSON.stringify(channelConfig),
        ); // 1 week expiration

        await pubClientPool.release(client);
      }
    }

    const sRedisChannelOccupancy = await pubClient.get(channelOccupancyKey);
    let channelOccupancy = 0;

    logger.debug(
      `[handleJoinChannel] from=${from} ${channelId} context=${context} clientType=${clientType} occupancy=${sRedisChannelOccupancy}`,
    );

    if (sRedisChannelOccupancy) {
      channelOccupancy = parseInt(sRedisChannelOccupancy, 10);
    } else {
      logger.debug(
        `[handleJoinChannel] ${channelId} from ${socketId} -- room not found -- creating it now`,
      );

      await pubClient.set(channelOccupancyKey, 0);
    }

    // room should be < MAX_CLIENTS_PER_ROOM since we haven't joined yet
    const room = io.sockets.adapter.rooms.get(channelId);
    // roomOccupancy can potentially be 0 instead of 1 if the dapp and wallet were dispatched on different servers
    // channelOccupancy should be the correct value as it represents the global state accross all servers
    let roomOccupancy = room?.size ?? 0;

    const isSocketInRoom = room?.has(socketId) ?? false;
    if (isSocketInRoom) {
      logger.warn(
        `[handleJoinChannel] Socket ${socketId} already in room ${channelId} `,
        {
          channelId,
          socketId,
          clientIp,
        },
      );
    } else {
      // Join and get the number of clients in the room
      await socket.join(channelId);
    }

    channelOccupancy = parseInt(
      (await pubClient.get(channelOccupancyKey)) ?? '1',
      10,
    );
    //  Refresh the room occupancy -it should now matches channel occupancy
    roomOccupancy = io.sockets.adapter.rooms.get(channelId)?.size ?? 0;

    // There may be -1 discrepency between room and channel occupancy depending if they are connected on the same server or not
    if (channelOccupancy - roomOccupancy > 1 || channelOccupancy < 0) {
      // Send warning if anything different than allowed discrepancy
      logger.warn(
        `[handleJoinChannel] INVALID occupancy room=${roomOccupancy} channel=${channelOccupancy}`,
        {
          channelId,
          socketId,
          clientIp,
        },
      );
    }

    logger.info(
      `[handleJoinChannel] from=${from} ${channelId}, ready=${channelConfig?.ready} persistence=${channelConfig?.persistence} Occupancy: ${channelOccupancy}`,
      {
        channelId,
        socketId,
        clientIp,
        roomOccupancy,
        channelOccupancy,
      },
    );

    if (
      !channelConfig?.ready &&
      clientType === 'dapp' &&
      channelConfig?.walletKey
    ) {
      logger.warn(
        `[handleJoinChannel] Channel ${channelId} is not ready yet --- send key_handshake_wallet`,
        {
          channelId,
          socketId,
          clientIp,
        },
      );

      callback?.(null, {
        ready: channelConfig?.ready,
        persistence: channelConfig?.persistence,
        walletKey: channelConfig?.walletKey,
      });

      checkMessage({ clientType, channelId, socket });
      return;
    }

    if (!clientType && channelOccupancy < MAX_CLIENTS_PER_ROOM) {
      logger.debug(
        `[handleJoinChannel] emit clients_waiting_to_join-${channelId} - channelCount = ${channelOccupancy}`,
      );

      socket.emit(`clients_waiting_to_join-${channelId}`, channelOccupancy);
      return;
    }

    socket.on('disconnect', async (error) => {
      logger.info(
        `[disconnect event] from=${from} room ${channelId} ${error}`,
        {
          channelId,
          socketId,
          clientIp,
        },
      );

      // Inform the room of the disconnection
      socket.broadcast
        .to(channelId)
        .emit(`clients_disconnected-${channelId}`, error);
    });

    if (channelOccupancy >= MAX_CLIENTS_PER_ROOM) {
      logger.info(
        `[handleJoinChannel] emitting clients_connected-${channelId}`,
        {
          channelId,
          socketId,
          clientIp,
        },
      );

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

      checkMessage({ clientType, channelId, socket });
      return;
    }

    // Make sure to always call the callback
    callback?.(null, {});
  } catch (error) {
    logger.error(`[handleJoinChannel] Error in handleJoinChannel: ${error}`, {
      channelId,
      socketId,
      clientIp,
    });
  }
};
