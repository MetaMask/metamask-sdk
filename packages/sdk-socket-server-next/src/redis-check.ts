/* eslint-disable import/first */
import dotenv from 'dotenv';
// Dotenv must be loaded before importing local files
dotenv.config();
import { pubClient } from './analytics-api';

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
    // Test Redis connectivity via pubClient wrapper
    const key = 'testKey';
    const value = 'Hello, Redis!';

    // Set, get, delete as a single operation test
    logger.info('Testing Redis operations...');
    await pubClient.set(key, value, 'EX', '60');
    const fetchedValue = await pubClient.get(key);
    await pubClient.del(key);

    if (fetchedValue === value) {
      logger.info('✅ Redis operations completed successfully');
    } else {
      logger.error(`❌ Redis value mismatch: expected '${value}', got '${fetchedValue}'`);
    }
  } catch (error) {
    logger.error('❌ Redis operation failed:', error);
  }
}

testRedisOperations();
