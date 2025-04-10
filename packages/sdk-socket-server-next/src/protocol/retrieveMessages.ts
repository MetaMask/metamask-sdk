import { pubClient } from '../analytics-api';
import { getLogger } from '../logger';
import { ClientType } from '../socket-config';
import { QueuedMessage } from './handleMessage';
import { incrementKeyMigration } from '../metrics';

const logger = getLogger();

export const retrieveMessages = async ({
  channelId,
  clientType,
}: {
  channelId: string;
  clientType: ClientType;
}): Promise<QueuedMessage[]> => {
  // Force keys into the same hash slot in Redis Cluster, using a hash tag
  const queueKey = `queue:{${channelId}}:${clientType}`;
  // Legacy key without hash tag for backward compatibility
  const legacyQueueKey = `queue:${channelId}:${clientType}`;

  try {
    // Try new format first using pubClient wrapper
    let messageData = await pubClient.lrange(queueKey, 0, -1);

    // If no messages found with new format, try legacy format
    if (messageData.length === 0) {
      const legacyMessageData = await pubClient.lrange(legacyQueueKey, 0, -1);

      // If found messages in legacy format, migrate them to new format
      if (legacyMessageData.length > 0) {
        incrementKeyMigration({ migrationType: 'message-queue' });
        logger.info(`Migrating ${legacyMessageData.length} messages from ${legacyQueueKey} to ${queueKey}`);

        // Use pipeline for efficiency - note: pipeline uses global client in wrapper
        const pipeline = pubClient.pipeline();

        // Add all messages to the new queue
        for (const msg of legacyMessageData) {
          pipeline.rpush(queueKey, msg);
        }

        // Set expiry on the new queue
        pipeline.expire(queueKey, 3600); // 1 hour expiry

        // Delete the old queue after migration
        pipeline.del(legacyQueueKey);

        await pipeline.exec();

        // Use the legacy data for this request
        messageData = legacyMessageData;
      }
    }

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
