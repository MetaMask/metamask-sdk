import { pubClient } from '../api-config';
import { logger } from '../logger';
import { ClientType } from '../socket-config';
import { QueuedMessage } from './handleMessage';

export const retrieveMessages = async ({
  channelId,
  clientType,
}: {
  channelId: string;
  clientType: ClientType;
}): Promise<QueuedMessage[]> => {
  const queueKey = `queue:${channelId}:${clientType}`;
  try {
    const messageData = await pubClient.lrange(queueKey, 0, -1);
    const messages = messageData
      .map((msg) => JSON.parse(msg) as QueuedMessage)
      .filter((msg) => msg.message);
    return messages;
  } catch (error) {
    logger.error(
      `Error retrieving messages for channelId=${channelId}: ${error}`,
    );
    return [];
  }
};
