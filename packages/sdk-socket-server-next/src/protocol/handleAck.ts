import { Server, Socket } from 'socket.io';
import { pubClient } from '../analytics-api';
import { getLogger } from '../logger';
import { ClientType } from '../socket-config';
import { QueuedMessage } from './handleMessage';

const logger = getLogger();

export type ACKParams = {
  io: Server;
  socket: Socket;
  channelId: string;
  clientType?: ClientType;
  context?: string;
  ackId: string;
};

const IDENTIFIER = 'TO_REMOVE_';

export const handleAck = async ({
  channelId,
  ackId,
  socket,
  clientType,
}: ACKParams): Promise<void> => {
  // Force keys into the same hash slot in Redis Cluster, using a hash tag (a substring enclosed in curly braces {})
  const queueKey = `queue:{${channelId}}:${clientType}`;
  let messages: string[] = [];

  const socketId = socket.id;
  const clientIp = socket.request.socket.remoteAddress;
  try {
    // Retrieve all messages to find and remove the specified one
    const rawMessages = await pubClient.lrange(queueKey, 0, -1);
    messages = rawMessages.map((item) =>
      Array.isArray(item) ? item[1] : item,
    );

    logger.debug(
      `[handleAck] channelId=${channelId} -- Messages in ${clientType} queue: ${messages.length}`,
      messages,
    );

    const index = messages.findIndex((msg) => {
      if (msg.startsWith(IDENTIFIER)) {
        return false;
      }

      try {
        const parsed = JSON.parse(msg) as QueuedMessage;
        return parsed.ackId === ackId;
      } catch (e) {
        logger.error(
          `[handleAck] channelId=${channelId} -- Error parsing message`,
          msg,
          e,
        );
        return false;
      }
    });

    if (index === -1) {
      logger.warn(
        `[handleAck] channelId=${channelId} -- Message ${ackId} not found in ${clientType} queue.`,
        {
          channelId,
          socketId,
          clientIp,
        },
      );
    } else {
      const placeholder = `${IDENTIFIER}${new Date().getTime()}`; // Unique placeholder
      await pubClient.lset(queueKey, index, placeholder); // Set the message at index to unique placeholder
      await pubClient.lrem(queueKey, 1, placeholder); // Remove the unique placeholder
      logger.info(
        `[handleAck] channelId=${channelId} -- Message ${ackId} removed from ${clientType} queue.`,
        {
          channelId,
          socketId,
          clientIp,
        },
      );
    }
  } catch (error) {
    logger.error(
      `[handleAck] channelId=${channelId} -- Error removing message: ${error}`,
      {
        channelId,
        socketId,
        clientIp,
      },
    );
  }
};
