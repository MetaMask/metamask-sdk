/* eslint-disable node/no-process-env */
import { Server as HTTPServer } from 'http';
import { hostname } from 'os';
// import { createAdapter } from '@socket.io/redis-streams-adapter';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server, Socket } from 'socket.io';
import { validate } from 'uuid';
import { redisCluster } from './api-config';
import { logger } from './logger';
import {
  increaseRateLimits,
  rateLimiter,
  rateLimiterMessage,
  resetRateLimits,
  setLastConnectionErrorTimestamp,
} from './rate-limiter';

export const MAX_CLIENTS_PER_ROOM = 2;

export const configureSocketServer = async (
  server: HTTPServer,
): Promise<Server> => {
  const isDevelopment: boolean = process.env.NODE_ENV === 'development';
  const hasRateLimit = process.env.RATE_LIMITER === 'true';
  // const sdkKey = process.env.SDK_STREAM_NAME || 'sdk-key';
  const host = hostname();

  logger.info(
    `Start socket server with rate limiter: ${hasRateLimit} - isDevelopment: ${isDevelopment}`,
  );

  const subClient = redisCluster.duplicate();

  const adapter = createAdapter(redisCluster, subClient);

  const io = new Server(server, {
    adapter,
    cors: {
      origin: (_origin, callback) => {
        // Allow all origins
        callback(null, true);
      },
      credentials: true,
    },
  });

  io.of('/').adapter.on('join-room', async (roomId, socketId) => {
    if (!validate(roomId)) {
      return;
    }

    const channelOccupancy = await redisCluster.hget('channels', roomId);
    console.log(
      `'join-room' socket ${socketId} has joined room ${roomId} --> channelOccupancy=${channelOccupancy}`,
    );
  });

  io.of('/').adapter.on('leave-room', async (roomId, socketId) => {
    if (!validate(roomId)) {
      return;
    }

    // Decrement the number of clients in the room
    const channelOccupancy = await redisCluster.hincrby('channels', roomId, -1);

    console.log(
      `'leave-room' socket ${socketId} has left room ${roomId} --> channelOccupancy=${channelOccupancy}`,
    );

    if (channelOccupancy <= 0) {
      console.log(`'leave-room' room ${roomId} was deleted`);
      // remove from redis
      await redisCluster.hdel('channels', roomId);
    } else {
      console.log(
        `'leave-room' Room ${roomId} kept alive with ${channelOccupancy} clients`,
      );
    }
  });

  io.on('connection', (socket: Socket) => {
    const { clientsCount } = io.engine;
    const clientIp = socket.request.socket.remoteAddress;
    const socketId = socket.id;

    logger.info(`new socket connection`, {
      clientsCount,
      socketId,
      clientIp,
      host,
    });

    logger.debug(`test debug`);

    socket.on('create_channel', async (channelId: string) => {
      logger.info('create_channel', { id: channelId, socketId, clientIp });

      try {
        if (hasRateLimit) {
          await rateLimiter.consume(socket.handshake.address);
        }

        if (!validate(channelId)) {
          logger.info(`ERROR > create_channel id = ${channelId} invalid`);
          return socket.emit(`message-${channelId}`, {
            error: 'must specify a valid id',
          });
        }

        const room = io.sockets.adapter.rooms.get(channelId);
        if (!channelId) {
          logger.error(
            `ERROR > create_channel id = ${channelId} not specified`,
          );
          return socket.emit(`message-${channelId}`, {
            error: 'must specify an id',
          });
        }

        if (room) {
          logger.error(
            `ERROR > create_channel id = ${channelId} room already created`,
          );
          return socket.emit(`message-${channelId}`, {
            error: 'room already created',
          });
        }

        if (hasRateLimit) {
          resetRateLimits();
        }

        logger.debug(`joining channel ${channelId} + emit channel_created`);
        // Make sure to join both so that disconnection events are handled properl
        socket.join(channelId);
        // socket.broadcast.socketsJoin(channelId);

        // Initialize the channel occupancy to 1
        await redisCluster.hset('channels', channelId, 1);

        return socket.emit(`channel_created-${channelId}`, channelId);
      } catch (error) {
        setLastConnectionErrorTimestamp(Date.now());
        // increaseRateLimits(90);
        logger.error('ERROR> Error on create_channel', error);
        // emit an error message back to the client, if appropriate
        return socket.emit(`error`, { error: (error as Error).message });
      }
    });

    socket.on(
      'message',
      async (msg: {
        id: string;
        message: string;
        context: string;
        plaintext: string;
      }) => {
        const { id, message, context, plaintext } = msg;
        const isMobile = context === 'metamask-mobile';

        logger.debug(`received message`, msg);
        try {
          if (hasRateLimit) {
            await rateLimiterMessage.consume(socket.handshake.address);
          }

          const logContext: {
            id: string;
            message?: string;
            plaintext?: string;
            context?: string;
          } = {
            id,
            context,
          };

          if (isDevelopment) {
            logContext.plaintext = plaintext;
          }

          if (hasRateLimit) {
            resetRateLimits();
          }

          logger.info(
            `message-${id} received from { ${isMobile ? 'wallet' : 'dapp'} }`,
            { ...logContext, socketId, clientIp },
          );

          if (isDevelopment) {
            logger.debug(`message context`, JSON.stringify(context));
          }

          return socket.broadcast.to(id).emit(`message-${id}`, { id, message });
        } catch (error) {
          setLastConnectionErrorTimestamp(Date.now());
          increaseRateLimits(90);
          logger.error(`ERROR > Error on message: ${error} `);
          // emit an error message back to the client, if appropriate
          return socket.broadcast.emit(`message-${id}`, {
            error: (error as Error).message,
          });
        }
      },
    );

    socket.on(
      'ping',
      async ({
        id,
        message,
        context,
      }: {
        id: string;
        message: string;
        context: string;
      }) => {
        logger.info('INFO> ping received', { id, message, context });

        try {
          if (hasRateLimit) {
            await rateLimiterMessage.consume(socket.handshake.address);
          }
          socket.broadcast.to(id).emit(`ping-${id}`, { id, message });
        } catch (error) {
          logger.error('ERROR> Error on ping:', error);
          // emit an error message back to the client, if appropriate
          socket.emit(`ping-${id}`, { error: (error as Error).message });
        }
      },
    );

    socket.on('join_channel', async (channelId: string) => {
      if (hasRateLimit) {
        try {
          await rateLimiter.consume(socket.handshake.address);
        } catch (e) {
          logger.error('ERROR> Error while consuming rate limiter:', e);
          return;
        }
      }

      if (!validate(channelId)) {
        logger.error(`ERROR > join_channel ${channelId} invalid`);
        socket.emit(`message-${channelId}`, {
          error: 'must specify a valid id',
        });
        return;
      }

      logger.debug(`join_channel ${channelId} from ${socketId}`);
      try {
        const sRedisChannelOccupancy = await redisCluster.hget(
          'channels',
          channelId,
        );
        logger.debug(
          `join_channel ${channelId} from ${socketId} sRedisChannelOccupancy=${sRedisChannelOccupancy}`,
        );
        let channelOccupancy = 0;
        logger.debug(
          `join_channel ${channelId} from ${socketId} sRedisChannelOccupancy=${sRedisChannelOccupancy}`,
        );

        if (sRedisChannelOccupancy) {
          channelOccupancy = parseInt(sRedisChannelOccupancy, 10);
        } else {
          logger.debug(
            `join_channel ${channelId} from ${socketId} -- room not found -- creating it now`,
          );
          await redisCluster.hset('channels', channelId, 0);
        }

        // room should be < MAX_CLIENTS_PER_ROOM since we haven't joined yet
        const room = io.sockets.adapter.rooms.get(channelId);
        // roomOccupancy can potentially be 0 instead of 1 if the dapp and wallet were dispatched on different servers
        // channelOccupancy should be the correct value as it represents the global state accross all servers
        let roomOccupancy = room?.size ?? 0;

        const isSocketInRoom = room?.has(socketId) ?? false;
        if (isSocketInRoom) {
          logger.warn(
            `Socket ${socketId} already in room ${channelId} channelOccupancy=${channelOccupancy} roomOccupancy=${roomOccupancy}`,
          );
          socket.emit(`message-${channelId}`, { error: 'already joined' });
          return;
        }

        if (roomOccupancy >= MAX_CLIENTS_PER_ROOM) {
          logger.warn(`join_channel ${channelId} room already full`);
          socket.emit(`message-${channelId}`, { error: 'room already full' });
          return;
        }

        if (channelOccupancy >= MAX_CLIENTS_PER_ROOM) {
          logger.warn(`join_channel ${channelId} redis channel appears full`);
          socket.emit(`message-${channelId}`, { error: 'room already full' });
          return;
        }

        // Join and increment the number of clients in the room
        socket.join(channelId);
        channelOccupancy = await redisCluster.hincrby('channels', channelId, 1);
        //  Refresh the room occupancy -it should now matches channel occupancy
        roomOccupancy = io.sockets.adapter.rooms.get(channelId)?.size ?? 0;

        // There may be -1 discrepency between room and channel occupancy depending if they are connected on the same server or not
        if (channelOccupancy - roomOccupancy > 1 || channelOccupancy < 0) {
          // Send warning if anything different than allowed discrepancy
          logger.warn(
            `INVALID occupancy room=${roomOccupancy} channel=${channelOccupancy}`,
          );
        }

        logger.info(
          `Client ${socketId} joined channel ${channelId}. Occupancy: ${channelOccupancy}`,
          {
            id: channelId,
            socketId,
            clientIp,
            roomOccupancy,
            channelOccupancy,
          },
        );

        if (channelOccupancy < MAX_CLIENTS_PER_ROOM) {
          logger.debug(
            `emit clients_waiting_to_join-${channelId} - channelCount = ${channelOccupancy}`,
          );

          socket.emit(`clients_waiting_to_join-${channelId}`, channelOccupancy);
          return;
        }

        socket.on('disconnect', async (error) => {
          logger.info(`disconnect from room ${channelId}`, {
            id: channelId,
            socketId,
            clientIp,
            error,
          });

          // Inform the room of the disconnection
          socket.broadcast
            .to(channelId)
            .emit(`clients_disconnected-${channelId}`, error);
        });

        if (channelOccupancy >= MAX_CLIENTS_PER_ROOM) {
          logger.info(`emitting clients_connected-${channelId}`, channelId);

          // imform all clients of new arrival and that room is ready
          socket.broadcast
            .to(channelId)
            .emit(`clients_connected-${channelId}`, channelId);
          socket.emit(`clients_connected-${channelId}`, channelId);
        }
      } catch (error) {
        logger.error('ERROR> Error on join_channel', error);
      }
    });

    socket.on('leave_channel', (id: string) => {
      // only leave if we are in the room
      if (!socket.rooms.has(id)) {
        logger.warn(`leave_channel ${id} not in room`);
        return;
      }

      logger.info(`leave_channel ${id}`, { id, socketId, clientIp });
      socket.leave(id);
      socket.broadcast.to(id).emit(`clients_disconnected-${id}`);
    });

    socket.on(
      'check_room',
      async (
        channelId: string,
        callback: (
          error: Error | null,
          result?: { occupancy: number; channelOccupancy?: string },
        ) => void,
      ) => {
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
        const channelOccupancy =
          (await redisCluster.hget('channels', channelId)) ?? undefined;

        logger.info(
          `check_room occupancy=${occupancy}, channelOccupancy=${channelOccupancy}`,
          { socketId, clientIp, id: channelId },
        );
        // Callback with null as the first argument, meaning "no error"
        return callback(null, { occupancy, channelOccupancy });
      },
    );
  });

  return io;
};
