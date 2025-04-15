/* eslint-disable import/first */
import dotenv from 'dotenv';
// Dotenv must be loaded before importing local files
dotenv.config();
import { getGlobalRedisClient } from './analytics-api';

import { createLogger } from './logger';

const logger = createLogger(true);

// Initialize Redis Cluster client
let redisNodes: {
  host: string;
  port: number;
}[] = [];

if (process.env.REDIS_NODES) {
  // format: REDIS_NODES=redis://rediscluster-redis-cluster-0.rediscluster-redis-cluster-headless.redis.svc.cluster.local:6379,redis://rediscluster-redis-cluster-1.rediscluster-redis-cluster-headless.redis.svc.cluster.local:6379,redis://rediscluster-redis-cluster-2.rediscluster-redis-cluster-headless.redis.svc.cluster.local:6379
  redisNodes = process.env.REDIS_NODES.split(',').map((node) => {
    const [host, port] = node.replace('redis://', '').split(':');
    return {
      host,
      port: parseInt(port, 10),
    };
  });
}
logger.info('Redis nodes:', redisNodes);

if (redisNodes.length === 0) {
  logger.error('No Redis nodes found');
  process.exit(1);
}

async function testRedisOperations() {
  try {
    // Connect to Redis
    const cluster = getGlobalRedisClient();
    logger.info('Connected to Redis Cluster successfully');

    // Set a key in Redis
    const key = 'testKey';
    const value = 'Hello, Redis!';
    logger.info(`Setting ${key} in Redis`);
    await cluster.set(key, value, 'EX', 60); // Set key to expire in 60 seconds
    logger.info(`Set ${key} in Redis`);

    // Get the key from Redis
    const fetchedValue = await cluster.get(key);
    logger.info(`Got value from Redis: ${fetchedValue}`);

    // Disconnect from Redis
    cluster.disconnect();
    logger.info('Disconnected from Redis Cluster');
  } catch (error) {
    logger.error('Redis operation failed:', error);
  }
}

testRedisOperations();
