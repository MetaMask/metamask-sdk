import { Server, Socket } from 'socket.io';
import { pubClient } from '../api-config';
import { logger } from '../logger';
import { ClientType } from '../socket-config';
import { QueuedMessage } from './handleMessage';

export type ACKParams = {
  io: Server;
  socket: Socket;
  channelId: string;
  clientType?: ClientType;
  context?: string;
  ackId: string;
};

export const handleAck = async ({
  channelId,
  ackId,
  clientType,
}: ACKParams) => {
  const queueKey = `queue:${channelId}:${clientType}`;
  try {
    // Retrieve all messages to find and remove the specified one
    const messages = await pubClient.lrange(queueKey, 0, -1);
    logger.debug(
      `Messages in ${clientType} queue: ${messages.length}`,
      messages,
    );
    const index = messages.findIndex((msg) => {
      const parsed = JSON.parse(msg) as QueuedMessage;
      console.log(`parsed.ackId: ${parsed.ackId}, ackId: ${ackId}`);
      return parsed.ackId === ackId;
    });
    if (index === -1) {
      logger.warn(`Message ${ackId} not found in ${clientType} queue.`);
    } else {
      const placeholder = `TO_REMOVE_${new Date().getTime()}`; // Unique placeholder
      await pubClient.lset(queueKey, index, placeholder); // Set the message at index to unique placeholder
      await pubClient.lrem(queueKey, 1, placeholder); // Remove the unique placeholder
      logger.info(`Message ${ackId} removed from ${clientType} queue.`);
    }
  } catch (error) {
    logger.error(`Error removing message: ${error}`);
  }
};
