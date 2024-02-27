/* eslint-disable import/first */
import dotenv from 'dotenv';
import { Cluster } from 'ioredis';

// Dotenv must be loaded before importing local files
dotenv.config();

import { logger } from './logger';

// Assuming you've already configured your Redis Cluster nodes and logger as per your setup
const redisNodes = process.env.REDIS_NODES
  ? process.env.REDIS_NODES.split(',').map((node) => {
      const url = new URL(node); // Use the URL class to parse
      const nodeConfig = { host: url.hostname, port: parseInt(url.port, 10) };
      logger.info('Redis node:', nodeConfig);
      return nodeConfig;
    })
  : [
      { host: 'redis-master1', port: 6379 },
      { host: 'redis-master2', port: 6379 },
      { host: 'redis-master3', port: 6379 },
    ];
logger.info('Redis nodes:', redisNodes);

const redisClusterOptions = {
  slotsRefreshTimeout: 2000,
  redisOptions: {
    tls: {},
    password: process.env.REDIS_PASSWORD || 'yourPassword', // Use environment variable for password
  },
};

let redisCluster: Cluster | undefined;

function getRedisCluster(): Cluster {
  if (!redisCluster) {
    redisCluster = new Cluster(redisNodes, redisClusterOptions);
  }

  redisCluster.on('error', (error) => {
    logger.error('Redis error:', error);
  });

  redisCluster.on('connect', () => {
    logger.info('Connected to Redis Cluster successfully');
  });

  redisCluster.on('close', () => {
    logger.info('Disconnected from Redis Cluster');
  });

  redisCluster.on('reconnecting', () => {
    logger.info('Reconnecting to Redis Cluster');
  });

  redisCluster.on('end', () => {
    logger.info('Redis Cluster connection ended');
  });

  redisCluster.on('wait', () => {
    logger.info('Redis Cluster waiting for connection');
  });

  redisCluster.on('select', (node) => {
    logger.info('Redis Cluster selected node:', node);
  });

  return redisCluster;
}

async function testRedisOperations() {
  try {
    // Connect to Redis
    const cluster = getRedisCluster();
    logger.info('Connected to Redis Cluster successfully');

    // Set a key in Redis
    const key = 'testKey';
    const value = 'Hello, Redis!';
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
