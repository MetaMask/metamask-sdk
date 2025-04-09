import { pubClient } from '../analytics-api';
import { getLogger } from '../logger';
import { ClientType } from '../socket-config';
import { QueuedMessage } from './handleMessage';

const logger = getLogger();

export const retrieveMessages = async ({
  channelId,
  clientType,
}: {
  channelId: string;
  clientType: ClientType;
}): Promise<QueuedMessage[]> => {
  // Force keys into the same hash slot in Redis Cluster, using a hash tag (a substring enclosed in curly braces {})
  const queueKey = `queue:{${channelId}}:${clientType}`;
  try {
    const messageData = await pubClient.lrange(queueKey, 0, -1);
    const messages = messageData
      .map((msg) => JSON.parse(msg) as QueuedMessage)
      .filter((msg) => msg.message);
    return messages;
  } catch (error) {
    logger.error(
      `[retrieveMessages] Error retrieving messages for channelId=${channelId}: ${error}`,
    );
    return [];
  }
};
