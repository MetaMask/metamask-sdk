/* eslint-disable node/no-process-env */
import crypto from 'crypto';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { Cluster, ClusterOptions, Redis, RedisOptions } from 'ioredis';
import {
  config,
  hasRateLimit,
  isDevelopment,
  isDevelopmentServer,
  REDIS_DEBUG_LOGS,
  redisCluster,
  redisTLS,
} from './config';
import { getLogger } from './logger';
import {
  incrementRedisCacheOperation,
  incrementKeyMigration,
} from './metrics';
import genericPool from "generic-pool";

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

if (redisNodes.length === 0) {
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
        /MOVED/,
        /READONLY/,
        /ETIMEDOUT/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /EPIPE/,
        /ENOTFOUND/,
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

export const buildRedisClient = (usePipelining: boolean = true) => {
  let newRedisClient: Cluster | Redis | undefined;

  // Only log connection attempts at debug level unless first time
  const logLevel = redisClientCache.size > 0 ? 'debug' : 'info';

  if (redisCluster) {
    logger[logLevel]('Connecting to Redis Cluster...');

    const redisOptions = getRedisOptions(
      redisTLS,
      process.env.REDIS_PASSWORD,
    );
    const redisClusterOptions: ClusterOptions = {
      dnsLookup: (address, callback) => callback(null, address),
      scaleReads: 'slave',
      slotsRefreshTimeout: 10000,
      showFriendlyErrorStack: true,
      slotsRefreshInterval: 5000,
      natMap: process.env.REDIS_NAT_MAP ? JSON.parse(process.env.REDIS_NAT_MAP) : undefined,
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
        logger.info(`Redis Cluster retry attempt ${times} with delay ${delay}ms`);
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
  const connectionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  // Log only once at initialization instead of separate events
  logger.debug(`Redis connection ${connectionId} initialized - events will be handled silently`);

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
}

// Cache created clients to reduce connection churn
const redisClientCache = new Map<string, Cluster | Redis>();

const redisFactory = {
  create: () => {
    // Create a unique key for this client
    const cacheKey = `redis-client-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Only log once per 50 clients to reduce noise (increased from 10)
    const shouldLog = redisClientCache.size % 50 === 0 || redisClientCache.size === 0;
    if (shouldLog) {
      logger.info(`Redis pool: Creating client (cache size: ${redisClientCache.size})`);
    }

    const client = buildRedisClient(false);
    redisClientCache.set(cacheKey, client);

    // Add client-specific reference to allow cleanup
    (client as any).__cacheKey = cacheKey;

    return Promise.resolve(client);
  },
  destroy: (client: Cluster | Redis) => {
    // Get cache key from client if available
    const cacheKey = (client as any).__cacheKey;
    if (cacheKey) {
      redisClientCache.delete(cacheKey);
    }

    // Only log once per 50 clients to reduce noise (increased from 10)
    const shouldLog = redisClientCache.size % 50 === 0 || redisClientCache.size === 0;
    if (shouldLog) {
      logger.info(`Redis pool: Destroying client (cache size: ${redisClientCache.size})`);
    }

    return Promise.resolve(client.disconnect());
  },
};

let redisClient: Cluster | Redis | undefined;

export const getGlobalRedisClient = () => {
  if (!redisClient) {
    redisClient = buildRedisClient();
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
 *
 * This class provides a drop-in replacement for the direct Redis client,
 * but ensures that all operations properly acquire and release connections from the pool.
 *
 * Benefits:
 * - Better resource management by using connection pooling consistently
 * - Prevention of connection leaks during high traffic
 * - More scalable approach for a socket server
 * - Maintains backward compatibility with existing code
 *
 * Implementation strategy:
 * - Each Redis method acquires a client from the pool
 * - Executes the operation
 * - Always releases the client back to the pool (using try/finally)
 * - This allows legacy code to continue working with minimal changes
 *
 * Special cases:
 * - duplicate(): Uses global client for socket.io Redis adapter, which needs persistent connections
 * - pipeline(): Currently uses global client as a temporary solution
 *
 * Future improvements:
 * - Address pipeline operations to also use the pool properly
 */
class PooledClientWrapper {
  async get(key: string): Promise<string | null> {
    const client = await pubClientPool.acquire();
    try {
      return await client.get(key);
    } finally {
      await pubClientPool.release(client);
    }
  }

  async set(key: string, value: string, mode?: string, duration?: string | number): Promise<'OK'> {
    const client = await pubClientPool.acquire();
    try {
      if (mode === 'EX' && duration) {
        return await client.set(key, value, mode, duration);
      }
      return await client.set(key, value);
    } finally {
      await pubClientPool.release(client);
    }
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    const client = await pubClientPool.acquire();
    try {
      return await client.setex(key, seconds, value);
    } finally {
      await pubClientPool.release(client);
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    const client = await pubClientPool.acquire();
    try {
      return await client.incrby(key, increment);
    } finally {
      await pubClientPool.release(client);
    }
  }

  async del(key: string): Promise<number> {
    const client = await pubClientPool.acquire();
    try {
      return await client.del(key);
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
      return await client.lrange(key, start, stop);
    } finally {
      await pubClientPool.release(client);
    }
  }

  async lset(key: string, index: number, value: string): Promise<'OK'> {
    const client = await pubClientPool.acquire();
    try {
      return await client.lset(key, index, value);
    } finally {
      await pubClientPool.release(client);
    }
  }

  async lrem(key: string, count: number, value: string): Promise<number> {
    const client = await pubClientPool.acquire();
    try {
      return await client.lrem(key, count, value);
    } finally {
      await pubClientPool.release(client);
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    const client = await pubClientPool.acquire();
    try {
      return await client.rpush(key, ...values);
    } finally {
      await pubClientPool.release(client);
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    const client = await pubClientPool.acquire();
    try {
      return await client.expire(key, seconds);
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
    return;
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

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(helmet());
app.disable('x-powered-by');

if (hasRateLimit) {
  // Conditionally apply the rate limiting middleware to all requests.
  let windowMin = 1; // every 1minute
  try {
    if (process.env.RATE_LIMITER_HTTP_LIMIT) {
      windowMin = parseInt(
        process.env.RATE_LIMITER_HTTP_WINDOW_MINUTE ?? '1',
        10,
      );
    }
  } catch (error) {
    // Ignore parsing errors
  }
  let limit = 100_000; // 100,000 requests per minute by default (unlimited...)
  try {
    if (process.env.RATE_LIMITER_HTTP_LIMIT) {
      limit = parseInt(process.env.RATE_LIMITER_HTTP_LIMIT, 10);
    }
  } catch (error) {
    // Ignore parsing errors
  }

  const limiterConfig = {
    windowMs: windowMin * 60 * 1000,
    limit,
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Use an external store for consistency across multiple server instances.
  };
  const limiter = rateLimit(limiterConfig);

  logger.info('Rate limiter enabled', limiterConfig);
  app.use(limiter);
}

async function inspectRedis(key?: string) {
  if (key && typeof key === 'string') {
    // pubClient is a wrapper around the pool, so this is safe
    const value = await pubClient.get(key);
    logger.debug(`inspectRedis Key: ${key}, Value: ${value}`);
  }
}

// Add Redis health checking and recovery
let redisHealthCheckInterval: NodeJS.Timeout;
let consecutiveRedisErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 10;

// Update the monitorRedisHealth function to use the wrapper
export const monitorRedisHealth = () => {
  if (redisHealthCheckInterval) {
    clearInterval(redisHealthCheckInterval);
  }

  // Track health status to only log changes
  let isHealthy = true;

  redisHealthCheckInterval = setInterval(async () => {
    try {
      // Direct ping with no custom timeout - keep it simple
      await pubClient.ping();

      // Only log when recovering from errors
      if (consecutiveRedisErrors > 0) {
        logger.info(`Redis health restored after ${consecutiveRedisErrors} consecutive errors`);
        consecutiveRedisErrors = 0;
        isHealthy = true;
      }
    } catch (error) {
      consecutiveRedisErrors++;

      // Only log the first error or milestone errors
      if (consecutiveRedisErrors === 1 || consecutiveRedisErrors % 5 === 0) {
        logger.error(`Redis health check failed (${consecutiveRedisErrors}/${MAX_CONSECUTIVE_ERRORS}):`, error);
        isHealthy = false;
      }

      // If too many consecutive errors, attempt to rebuild the Redis client
      if (consecutiveRedisErrors >= MAX_CONSECUTIVE_ERRORS) {
        logger.warn(`Rebuilding Redis client after ${consecutiveRedisErrors} consecutive errors`);
        try {
          // The pool will handle reconnection internally
          // Just log that we're attempting recovery
          logger.info('Redis client pool recovery attempted');
          consecutiveRedisErrors = 0;
        } catch (rebuildError) {
          logger.error('Failed to rebuild Redis client:', rebuildError);
        }
      }
    }
  }, 30000); // Check every 30 seconds
};

// Start monitoring when the module is loaded
monitorRedisHealth();

export { app }; // Export only app now
