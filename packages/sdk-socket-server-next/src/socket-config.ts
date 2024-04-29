/* eslint-disable node/no-process-env */
import { Server as HTTPServer } from 'http';
import { hostname } from 'os';
import { createAdapter } from '@socket.io/redis-adapter';

import { Server, Socket } from 'socket.io';
import { validate } from 'uuid';
import { pubClient } from './api-config';
import { logger } from './logger';
import { handleCheckRoom } from './protocol/handleCheckRoom';
import {
  handleJoinChannel,
  JoinChannelParams,
} from './protocol/handleJoinChannel';
import { handleMessage, MessageParams } from './protocol/handleMessage';
import { handlePing } from './protocol/handlePing';
import { ACKParams, handleAck } from './protocol/handleAck';

export const MAX_CLIENTS_PER_ROOM = 2;

export const MISSING_CONTEXT = '___MISSING_CONTEXT___';

export type ClientType = 'dapp' | 'wallet';

export const configureSocketServer = async (
  server: HTTPServer,
): Promise<Server> => {
  const isDevelopment: boolean = process.env.NODE_ENV === 'development';
  const hasRateLimit = process.env.RATE_LIMITER === 'true';
  const host = hostname();

  logger.info(
    `Start socket server with rate limiter: ${hasRateLimit} - isDevelopment: ${isDevelopment}`,
  );

  const subClient = pubClient.duplicate();

  subClient.on('error', (error) => {
    logger.error('Redis subClient error:', error);
  });

  subClient.on('ready', () => {
    logger.info('Redis subClient ready');
  });

  const adapter = createAdapter(pubClient, subClient);

  type SocketJoinChannelParams = {
    channelId: string;
    clientType?: ClientType;
    context?: string;
  };

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
    console.log(`'join-room' socket ${socketId} has joined room ${roomId}`);
    if (!validate(roomId)) {
      return;
    }

    const channelOccupancy = await pubClient.hincrby('channels', roomId, 1);
    console.log(
      `'join-room' socket ${socketId} has joined room ${roomId} --> channelOccupancy=${channelOccupancy}`,
    );
  });

  io.of('/').adapter.on('leave-room', async (roomId, socketId) => {
    console.log(`'leave-room' socket ${socketId} has left room ${roomId}`);
    if (!validate(roomId)) {
      // Ignore invalid room IDs
      return;
    }

    // Decrement the number of clients in the room
    const channelOccupancy = await pubClient.hincrby('channels', roomId, -1);

    console.log(
      `'leave-room' socket ${socketId} has left room ${roomId} --> channelOccupancy=${channelOccupancy}`,
    );

    if (channelOccupancy <= 0) {
      console.log(`'leave-room' room ${roomId} was deleted`);
      // remove from redis
      await pubClient.hdel('channels', roomId);
    } else {
      console.log(
        `'leave-room' Room ${roomId} kept alive with ${channelOccupancy} clients`,
      );
      // Inform the room of the disconnection
      io.to(roomId).emit(`clients_disconnected-${roomId}`);
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

    socket.on(
      'create_channel',
      (
        channelIdOrParams: string | SocketJoinChannelParams,
        callback: (error: string | null, result?: unknown) => void,
      ) => {
        const params: JoinChannelParams = {
          channelId: 'temp', // default value to be overwritten
          socket,
          callback,
          io,
          hasRateLimit,
        };

        if (typeof channelIdOrParams === 'string') {
          params.channelId = channelIdOrParams;
        } else {
          params.channelId = channelIdOrParams.channelId;
          params.clientType = channelIdOrParams.clientType;
          params.context = channelIdOrParams.context;
        }

        handleJoinChannel(params).catch((error) => {
          logger.error('Error creating channel:', error);
        });
      },
    );

    socket.on(
      'ack',
      ({
        channelId,
        ackId,
        clientType,
      }: {
        channelId: string;
        ackId: string;
        clientType: ClientType;
      }) => {
        const ackParams: ACKParams = {
          io,
          socket,
          channelId,
          ackId,
          clientType,
        };
        handleAck(ackParams).catch((error) => {
          logger.error('Error handling ack:', error);
        });
      },
    );

    socket.on(
      'message',
      (
        msg: {
          id: string;
          message: string;
          context: string;
          plaintext: string;
          clientType?: ClientType;
        },
        callback: (error: string | null, result?: unknown) => void,
      ) => {
        const { id, message, context, clientType, plaintext } = msg;
        const params: MessageParams = {
          channelId: id,
          clientIp,
          clientType,
          context,
          message,
          plaintext,
          socket,
          io,
          hasRateLimit,
          callback,
        };
        handleMessage(params).catch((error) => {
          logger.error('Error handling message:', error);
        });
      },
    );

    socket.on(
      'ping',
      (
        {
          id,
          message,
          context,
        }: {
          id: string;
          message: string;
          context: string;
        },
        callback: (error: string | null, result?: unknown) => void,
      ) => {
        handlePing({
          channelId: id,
          socket,
          io,
          message,
          context,
          callback,
        }).catch((error) => {
          logger.error('Error handling ping:', error);
        });
      },
    );

    socket.on(
      'join_channel',
      (
        channelIdOrParams: string | SocketJoinChannelParams,
        callback?: (error: string | null, result?: unknown) => void,
      ) => {
        const params: JoinChannelParams = {
          channelId: 'temp', // default value to be overwritten
          socket,
          io,
          hasRateLimit,
          callback,
        };

        console.log(`join_channel callback=${typeof callback}`);

        if (typeof channelIdOrParams === 'string') {
          // backward compatibility
          params.channelId = channelIdOrParams;
        } else {
          params.channelId = channelIdOrParams.channelId;
          params.clientType = channelIdOrParams.clientType;
          params.context = channelIdOrParams.context;
        }

        handleJoinChannel(params).catch((error) => {
          logger.error('Error joining channel:', error);
        });
      },
    );

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
      (
        channelId: string,
        callback: (
          error: Error | null,
          result?: { occupancy: number; channelOccupancy?: string },
        ) => void,
      ) => {
        handleCheckRoom({ channelId, io, socket, callback }).catch((error) => {
          logger.error('Error checking room:', error);
        });
      },
    );
  });

  return io;
};
