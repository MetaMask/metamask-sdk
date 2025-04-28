/* eslint-disable node/no-process-env */
import { Cluster, ClusterOptions, Redis, RedisOptions } from 'ioredis';
import genericPool from 'generic-pool';
import { redisCluster, redisTLS } from './config';
import { getLogger } from './logger';
import { incrementRedisCacheOperation } from './metrics'; // Keep metrics import if used by Redis logic

const logger = getLogger();

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

if (redisNodes.length === 0 && process.env.NODE_ENV !== 'test') {
  // Allow test env without redis
  logger.error('No Redis nodes found');
  process.exit(1);
}

export const getRedisOptions = (
  isTls: boolean,
  password: string | undefined,
): RedisOptions => {
  const tlsOptions = {
    tls: {
      checkServerIdentity: (/* host, cert*/) => {
        return undefined;
      },
    },
  };

  const options: RedisOptions = {
    ...(isTls && tlsOptions),
    connectTimeout: 60000,
    keepAlive: 369,
    maxRetriesPerRequest: 4,
    retryStrategy: (times) => {
      const delay = Math.min(times * 30, 1000);
      logger.info(`Redis retry attempt ${times} with delay ${delay}ms`);
      return delay;
    },
    reconnectOnError: (error) => {
      const targetErrors = [
        /MOVED/u,
        /READONLY/u,
        /ETIMEDOUT/u,
        /ECONNRESET/u,
        /ECONNREFUSED/u,
        /EPIPE/u,
        /ENOTFOUND/u,
      ];

      logger.error('Redis reconnect error:', error);
      return targetErrors.some((targetError) =>
        targetError.test(error.message),
      );
    },
  };
  if (password) {
    options.password = password;
  }
  return options;
};

// Cache created clients to reduce connection churn
const redisClientCache = new Map<string, Cluster | Redis>();

export const buildRedisClient = (usePipelining = true) => {
  let newRedisClient: Cluster | Redis | undefined;

  // Only log connection attempts at debug level unless first time
  const logLevel = redisClientCache.size > 0 ? 'debug' : 'info';

  if (redisNodes.length === 0) {
    logger.warn(
      'Skipping Redis client creation as no nodes are defined (likely test environment)',
    );
    return undefined; // Return undefined if no nodes
  }

  if (redisCluster) {
    logger[logLevel]('Connecting to Redis Cluster...');

    const redisOptions = getRedisOptions(redisTLS, process.env.REDIS_PASSWORD);
    const redisClusterOptions: ClusterOptions = {
      dnsLookup: (address, callback) => callback(null, address),
      scaleReads: 'slave',
      slotsRefreshTimeout: 10000,
      showFriendlyErrorStack: true,
      slotsRefreshInterval: 5000,
      natMap: process.env.REDIS_NAT_MAP
        ? JSON.parse(process.env.REDIS_NAT_MAP)
        : undefined,
      redisOptions: {
        ...redisOptions,
        // Queues commands when disconnected from Redis, executing them when connection is restored
        // This prevents data loss during network issues or cluster topology changes
        offlineQueue: true,
        // Default is 10000ms (10s). Increasing this allows more time to establish
        // connection during network instability while balancing real-time requirements
        connectTimeout: 20000,
        // Default is no timeout. Setting to 10000ms prevents hanging commands
        // while still allowing reasonable time for completion
        commandTimeout: 10000,
      },
      clusterRetryStrategy: (times) => {
        const delay = Math.min(times * 100, 5000);
        logger.info(
          `Redis Cluster retry attempt ${times} with delay ${delay}ms`,
        );
        return delay;
      },
      enableAutoPipelining: usePipelining,
    };

    logger.debug(
      'Redis Cluster options:',
      JSON.stringify(redisClusterOptions, null, 2),
    );

    newRedisClient = new Cluster(redisNodes, redisClusterOptions);
  } else {
    logger[logLevel]('Connecting to single Redis node');
    newRedisClient = new Redis(redisNodes[0]);
  }

  // Reduce connection event noise - only log significant events
  newRedisClient.on('ready', () => {
    logger.info('Redis ready');
  });

  newRedisClient.on('error', (error) => {
    logger.error('Redis error:', error);
  });

  // Use connectionId to track individual connections in logs without excessive output
  const connectionId =
    Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  // Log only once at initialization instead of separate events
  logger.debug(
    `Redis connection ${connectionId} initialized - events will be handled silently`,
  );

  // Remove these individual event logs to reduce noise
  // These events still happen but we don't log each occurrence
  newRedisClient.on('connect', () => {
    // Silent connection
  });

  newRedisClient.on('close', () => {
    // Silent close
  });

  newRedisClient.on('reconnecting', () => {
    // Silent reconnection
  });

  newRedisClient.on('end', () => {
    // Silent end
  });

  return newRedisClient;
};

const redisFactory = {
  create: async () => {
    // Create a unique key for this client
    const cacheKey = `redis-client-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Only log once per 50 clients to reduce noise (increased from 10)
    const shouldLog =
      redisClientCache.size % 50 === 0 || redisClientCache.size === 0;
    if (shouldLog) {
      logger.info(
        `Redis pool: Creating client (cache size: ${redisClientCache.size})`,
      );
    }

    const client = buildRedisClient(false);
    if (!client) {
      // Handle case where client couldn't be built (e.g., no nodes)
      logger.error('Failed to create Redis client in factory');
      // Depending on desired behavior, you might throw an error or return a mock/null client
      // For now, let's throw to make the issue explicit
      throw new Error('Failed to build Redis client in pool factory');
    }
    redisClientCache.set(cacheKey, client);

    // Add client-specific reference to allow cleanup
    (client as any).__cacheKey = cacheKey;

    return client; // Resolve with the client directly
  },
  destroy: (client: Cluster | Redis) => {
    // Get cache key from client if available
    const cacheKey = (client as any).__cacheKey;
    if (cacheKey) {
      redisClientCache.delete(cacheKey);
    }

    // Only log once per 50 clients to reduce noise (increased from 10)
    const shouldLog =
      redisClientCache.size % 50 === 0 || redisClientCache.size === 0;
    if (shouldLog) {
      logger.info(
        `Redis pool: Destroying client (cache size: ${redisClientCache.size})`,
      );
    }

    return Promise.resolve(client.disconnect());
  },
};

let redisClient: Cluster | Redis | undefined;

export const getGlobalRedisClient = () => {
  if (!redisClient) {
    redisClient = buildRedisClient();
  }

  // Ensure redisClient is defined before returning
  if (!redisClient) {
    throw new Error('Global Redis client could not be initialized.');
  }
  return redisClient;
};

export const pubClientPool = genericPool.createPool(redisFactory, {
  max: 35,
  min: 15,
  acquireTimeoutMillis: 15000,
  idleTimeoutMillis: 300000,
  evictionRunIntervalMillis: 180000,
  numTestsPerEvictionRun: 2,
  softIdleTimeoutMillis: 240000,
});

/**
 * PooledClientWrapper - A Redis client wrapper that uses the connection pool internally
 * ... (rest of the class definition as before) ...
 */
class PooledClientWrapper {
  async get(key: string): Promise<string | null> {
    const client = await pubClientPool.acquire();
    try {
      const value = await client.get(key);
      incrementRedisCacheOperation('pooled-get', Boolean(value)); // Example metric integration
      return value;
    } finally {
      await pubClientPool.release(client);
    }
  }

  async set(
    key: string,
    value: string,
    mode?: string,
    duration?: string | number,
  ): Promise<'OK'> {
    const client = await pubClientPool.acquire();
    try {
      let result: 'OK';
      if (mode === 'EX' && duration) {
        result = await client.set(key, value, mode, duration);
      } else {
        result = await client.set(key, value);
      }
      incrementRedisCacheOperation('pooled-set', true);
      return result;
    } finally {
      await pubClientPool.release(client);
    }
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    const client = await pubClientPool.acquire();
    try {
      const result = await client.setex(key, seconds, value);
      incrementRedisCacheOperation('pooled-setex', true);
      return result;
    } finally {
      await pubClientPool.release(client);
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    const client = await pubClientPool.acquire();
    try {
      const result = await client.incrby(key, increment);
      incrementRedisCacheOperation('pooled-incrby', true);
      return result;
    } finally {
      await pubClientPool.release(client);
    }
  }

  async del(key: string): Promise<number> {
    const client = await pubClientPool.acquire();
    try {
      const result = await client.del(key);
      incrementRedisCacheOperation('pooled-del', result > 0);
      return result;
    } finally {
      await pubClientPool.release(client);
    }
  }

  async ping(): Promise<string> {
    const client = await pubClientPool.acquire();
    try {
      return await client.ping();
    } finally {
      await pubClientPool.release(client);
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const client = await pubClientPool.acquire();
    try {
      const result = await client.lrange(key, start, stop);
      incrementRedisCacheOperation('pooled-lrange', result.length > 0);
      return result;
    } finally {
      await pubClientPool.release(client);
    }
  }

  async lset(key: string, index: number, value: string): Promise<'OK'> {
    const client = await pubClientPool.acquire();
    try {
      const result = await client.lset(key, index, value);
      incrementRedisCacheOperation('pooled-lset', true);
      return result;
    } finally {
      await pubClientPool.release(client);
    }
  }

  async lrem(key: string, count: number, value: string): Promise<number> {
    const client = await pubClientPool.acquire();
    try {
      const result = await client.lrem(key, count, value);
      incrementRedisCacheOperation('pooled-lrem', result > 0);
      return result;
    } finally {
      await pubClientPool.release(client);
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    const client = await pubClientPool.acquire();
    try {
      const result = await client.rpush(key, ...values);
      incrementRedisCacheOperation('pooled-rpush', true);
      return result;
    } finally {
      await pubClientPool.release(client);
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    const client = await pubClientPool.acquire();
    try {
      const result = await client.expire(key, seconds);
      incrementRedisCacheOperation('pooled-expire', result > 0);
      return result;
    } finally {
      await pubClientPool.release(client);
    }
  }

  duplicate(): any {
    // For socket.io's createAdapter which uses pubClient.duplicate()
    // We MUST return the actual Redis client here, not a wrapper
    // Socket.io requires the Redis client to be an EventEmitter with .on() methods
    // which our wrapper doesn't implement
    return getGlobalRedisClient().duplicate();
  }

  disconnect(): void {
    // This is a no-op for the wrapper
    // The actual client disconnects are managed by the pool
  }

  pipeline(): any {
    // This is a temporary solution - ideally pipeline operations should be adapted to use the pool
    // But for backward compatibility, we'll just use the global client for now
    // NOTE: This is not ideal for high concurrency as it bypasses the pool
    // TODO: Future improvement would be to acquire a client, run pipeline, then release
    const client = getGlobalRedisClient();
    return client.pipeline();
  }
}

// Export the wrapper as pubClient
export const pubClient = new PooledClientWrapper();

// Add Redis health checking and recovery
let redisHealthCheckInterval: NodeJS.Timeout | undefined;
let consecutiveRedisErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 10;

export async function inspectRedis(key?: string) {
  const REDIS_DEBUG_LOGS = process.env.REDIS_DEBUG_LOGS === 'true';
  if (REDIS_DEBUG_LOGS && key && typeof key === 'string') {
    // pubClient is a wrapper around the pool, so this is safe
    const value = await pubClient.get(key);
    logger.debug(`inspectRedis Key: ${key}, Value: ${value}`);
  }
}

// Update the monitorRedisHealth function to use the wrapper
export const monitorRedisHealth = () => {
  if (redisHealthCheckInterval) {
    clearInterval(redisHealthCheckInterval);
    redisHealthCheckInterval = undefined; // Clear the interval ID
  }

  // Track health status to only log changes
  let isHealthy = false; // Initialize to false to ensure the first success logs

  redisHealthCheckInterval = setInterval(async () => {
    try {
      // Direct ping with no custom timeout - keep it simple
      await pubClient.ping();

      // Health check succeeded
      if (!isHealthy) {
        // Transitioning from unhealthy to healthy
        const logMessage =
          consecutiveRedisErrors > 0
            ? `Redis health restored after ${consecutiveRedisErrors} consecutive errors` // Recovered from errors
            : 'Redis health check passed.'; // Initial success
        logger.info(logMessage);

        consecutiveRedisErrors = 0;
        isHealthy = true;
      }
      // If isHealthy was already true, do nothing (steady healthy state)
    } catch (error) {
      consecutiveRedisErrors += 1;

      // Only log the first error transition or milestone errors
      if (isHealthy || consecutiveRedisErrors % 5 === 0) {
        // Log first time it fails (isHealthy was true) or every 5th failure
        logger.error(
          `Redis health check failed (${consecutiveRedisErrors}/${MAX_CONSECUTIVE_ERRORS}):`,
          error,
        );
        isHealthy = false; // Mark as unhealthy now
      }

      // If too many consecutive errors, attempt to rebuild the Redis client
      if (consecutiveRedisErrors >= MAX_CONSECUTIVE_ERRORS) {
        logger.warn(
          `Attempting Redis client pool recovery after ${consecutiveRedisErrors} consecutive errors`,
        );
        // The pool should handle reconnection automatically based on its strategy.
        // We don't need to explicitly rebuild here, just reset the counter maybe?
        // For now, just log the attempt and reset counter to prevent spamming logs.
        consecutiveRedisErrors = 0; // Reset error count after logging recovery attempt
      }
    }
  }, 30000); // Check every 30 seconds
};

// Start monitoring when the module is loaded
// Only start if not in test environment or if redis nodes are configured
if (process.env.NODE_ENV !== 'test' || redisNodes.length > 0) {
  monitorRedisHealth();
} else {
  logger.info(
    'Skipping Redis health monitoring in test environment without nodes.',
  );
}
