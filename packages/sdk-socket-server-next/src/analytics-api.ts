/* eslint-disable node/no-process-env */
import crypto from 'crypto';
import Analytics from 'analytics-node';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { Cluster, ClusterOptions, Redis, RedisOptions } from 'ioredis';
import {
  config,
  EVENTS_DEBUG_LOGS,
  hasRateLimit,
  isDevelopment,
  isDevelopmentServer,
  REDIS_DEBUG_LOGS,
  redisCluster,
  redisTLS,
} from './config';
import { getLogger } from './logger';
import { ChannelInfo, extractChannelInfo } from './utils';
import { evtMetricsMiddleware } from './middleware-metrics';
import {
  incrementAnalyticsError,
  incrementAnalyticsEvents,
  incrementRedisCacheOperation,
} from './metrics';
import genericPool from "generic-pool";

const logger = getLogger();

// SDK version prev 0.27.0 uses 'sdk' as the default id, below value is the sha1 hash of 'sdk'
const SDK_EXTENSION_DEFAULT_ID = '5a374dcd2e5eb762b527af3a5bab6072a4d24493';

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
    connectTimeout: 30000,
    keepAlive: 369,
    maxRetriesPerRequest: 4,
    retryStrategy: (times) => Math.min(times * 30, 1000),
    reconnectOnError: (error) => {
      // eslint-disable-next-line require-unicode-regexp
      const targetErrors = [/MOVED/, /READONLY/, /ETIMEDOUT/];

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

  if (redisCluster) {
    logger.info('Connecting to Redis Cluster...');

    const redisOptions = getRedisOptions(
      redisTLS,
      process.env.REDIS_PASSWORD,
    );
    const redisClusterOptions: ClusterOptions = {
      dnsLookup: (address, callback) => callback(null, address),
      scaleReads: 'slave',
      slotsRefreshTimeout: 5000,
      showFriendlyErrorStack: true,
      slotsRefreshInterval: 2000,
      clusterRetryStrategy: (times) => Math.min(times * 30, 1000),
      enableAutoPipelining: usePipelining,
      redisOptions,
    };

    logger.debug(
      'Redis Cluster options:',
      JSON.stringify(redisClusterOptions, null, 2),
    );

    newRedisClient = new Cluster(redisNodes, redisClusterOptions);
  } else {
    logger.info('Connecting to single Redis node');
    newRedisClient = new Redis(redisNodes[0]);
  }

  newRedisClient.on('ready', () => {
    logger.info('Redis ready');
  });

  newRedisClient.on('error', (error) => {
    logger.error('Redis error:', error);
  });

  newRedisClient.on('connect', () => {
    logger.info('Connected to Redis Cluster successfully');
  });

  newRedisClient.on('close', () => {
    logger.info('Disconnected from Redis Cluster');
  });

  newRedisClient.on('reconnecting', () => {
    logger.info('Reconnecting to Redis Cluster');
  });

  newRedisClient.on('end', () => {
    logger.info('Redis Cluster connection ended');
  });

  newRedisClient.on('wait', () => {
    logger.info('Redis Cluster waiting for connection');
  });

  newRedisClient.on('select', (node) => {
    logger.info('Redis Cluster selected node:', node);
  });

  return newRedisClient;
}

const redisFactory = {
  create: () => {
    return Promise.resolve(buildRedisClient(false));
  },
  destroy: (client: Cluster | Redis) => {
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

export const pubClient = getGlobalRedisClient();
export const pubClientPool = genericPool.createPool(redisFactory, {
  max: 35,
  min: 15,
});

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
    const value = await pubClient.get(key);
    logger.debug(`inspectRedis Key: ${key}, Value: ${value}`);
  }
}

const analytics = new Analytics(
  isDevelopment || isDevelopmentServer
    ? process.env.SEGMENT_API_KEY_DEBUG || ''
    : process.env.SEGMENT_API_KEY_PRODUCTION || '',
  {
    flushInterval: isDevelopment ? 1000 : 10000,
    errorHandler: (err: Error) => {
      logger.error(`ERROR> Analytics-node flush failed: ${err}`);
    },
  },
);

app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    logger.info(`health check from`, {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'cf-connecting-ip': req.headers['cf-connecting-ip'],
    });
  }

  res.json({ success: true });
});

// Redirect /debug to /evt for backwards compatibility
app.post('/debug', (req, _res, next) => {
  req.url = '/evt'; // Redirect to /evt
  next(); // Pass control to the next handler (which will be /evt)
});

app.post('/evt', evtMetricsMiddleware, async (_req, res) => {
  try {
    const { body } = _req;

    if (!body.event) {
      logger.error(`Event is required`);
      incrementAnalyticsError('MissingEventError');
      return res.status(400).json({ error: 'event is required' });
    }

    if (!body.event.startsWith('sdk_')) {
      logger.error(`Wrong event name: ${body.event}`);
      incrementAnalyticsError('WrongEventNameError');
      return res.status(400).json({ error: 'wrong event name' });
    }

    const toCheckEvents = ['sdk_rpc_request_done', 'sdk_rpc_request'];
    const allowedMethods = [
      "eth_sendTransaction",
      "wallet_switchEthereumChain",
      "personal_sign",
      "eth_signTypedData_v4",
      "wallet_requestPermissions",
      "metamask_connectSign"
    ];

    // Filter: drop RPC events with unallowed methods silently, let all else through
    if (toCheckEvents.includes(body.event) && 
        (!body.method || !allowedMethods.includes(body.method))) {
      return res.json({ success: true });
    }

    let channelId: string = body.id || 'sdk';
    // Prevent caching of events coming from extension since they are not re-using the same id and prevent increasing redis queue size.
    let isExtensionEvent = body.from === 'extension';

    if (typeof channelId !== 'string') {
      logger.error(`Received event with invalid channelId: ${channelId}`, body);
      incrementAnalyticsError('InvalidChannelIdError');
      return res.status(400).json({ status: 'error' });
    }

    let isAnonUser = false;

    if (channelId === 'sdk') {
      isAnonUser = true;
      isExtensionEvent = true;
    }

    logger.debug(
      `Received event /evt channelId=${channelId} isExtensionEvent=${isExtensionEvent}`,
      body,
    );

    let userIdHash = isAnonUser
      ? crypto.createHash('sha1').update(channelId).digest('hex')
      : await pubClient.get(channelId);

    incrementRedisCacheOperation('analytics-get-channel-id', !!userIdHash);

    if (!userIdHash) {
      userIdHash = crypto.createHash('sha1').update(channelId).digest('hex');
      logger.info(
        `event: ${body.event} channelId: ${channelId}  - No cached channel info found for ${userIdHash} - creating new channelId`,
      );

      if (!isExtensionEvent) {
        await pubClient.set(
          channelId,
          userIdHash,
          'EX',
          config.channelExpiry.toString(),
        );
      }
    }

    if (REDIS_DEBUG_LOGS) {
      await inspectRedis(channelId);
    }

    let channelInfo: ChannelInfo | null;
    const cachedChannelInfo = isAnonUser
      ? null
      : await pubClient.get(userIdHash);

    incrementRedisCacheOperation(
      'analytics-get-channel-info',
      !!cachedChannelInfo,
    );

    if (cachedChannelInfo) {
      logger.debug(
        `Found cached channel info for ${userIdHash}`,
        cachedChannelInfo,
      );
      channelInfo = JSON.parse(cachedChannelInfo);
    } else {
      logger.info(
        `event: ${body.event} channelId: ${channelId}  - No cached channel info found for ${userIdHash}`,
      );

      // Extract channelInfo from any events if available
      channelInfo = extractChannelInfo(body);

      if (!channelInfo) {
        logger.info(
          `event: ${body.event} channelId: ${channelId}  - Invalid channelInfo format - event will be ignored`,
          JSON.stringify(body, null, 2),
        );
        // always return success
        return res.json({ success: true });
      }

      // Save the channelInfo in Redis
      logger.info(
        `Adding channelInfo for event=${body.event} channelId=${channelId} userIdHash=${userIdHash} expiry=${config.channelExpiry}`,
        channelInfo,
      );

      if (!isExtensionEvent) {
        await pubClient.set(
          userIdHash,
          JSON.stringify(channelInfo),
          'EX',
          config.channelExpiry.toString(),
        );
      }
    }

    if (REDIS_DEBUG_LOGS) {
      await inspectRedis(userIdHash);
    }

    const event = {
      userId: userIdHash,
      event: body.event,
      properties: {
        userId: userIdHash,
        ...body.properties,
        // Apply channelInfo properties
        ...channelInfo,
      },
    };

    if (!event.properties.dappId) {
      // Prevent "N/A" in url and ensure a valid dappId
      const newDappId =
        event.properties.url && event.properties.url !== 'N/A'
          ? event.properties.url
          : event.properties.title || 'N/A';
      event.properties.dappId = newDappId;
      logger.debug(
        `event: ${event.event} - dappId missing - replacing with '${newDappId}'`,
        event,
      );
    }

    // Define properties to be excluded
    const propertiesToExclude: string[] = ['icon', 'originationInfo', 'id'];

    for (const property in body) {
      if (
        Object.prototype.hasOwnProperty.call(body, property) &&
        body[property] &&
        !propertiesToExclude.includes(property)
      ) {
        event.properties[property] = body[property];
      }
    }

    if (EVENTS_DEBUG_LOGS) {
      logger.debug('Event object:', event);
    }

    incrementAnalyticsEvents(
      body.from,
      !isAnonUser,
      event.event,
      body.platform,
      body.sdkVersion,
    );

    analytics.track(event, function (err: Error) {
      if (EVENTS_DEBUG_LOGS) {
        logger.info('Segment batch', JSON.stringify({ event }, null, 2));
      } else {
        logger.info('Segment batch', { event });
      }

      if (err) {
        incrementAnalyticsError('SegmentError');
        logger.error('Segment error:', err);
      }
    });

    return res.json({ success: true });
  } catch (error) {
    incrementAnalyticsError(
      error instanceof Error ? error.constructor.name : 'UnknownError',
    );
    return res.json({ error });
  }
});

export { analytics, app };
