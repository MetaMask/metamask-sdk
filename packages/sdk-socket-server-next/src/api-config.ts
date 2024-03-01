/* eslint-disable node/no-process-env */
import crypto from 'crypto';
import Analytics from 'analytics-node';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { Cluster, ClusterOptions, Redis } from 'ioredis';
import { logger } from './logger';
import { isDevelopment, isDevelopmentServer } from '.';

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60; // expiration time of entries in Redis
const hasRateLimit = process.env.RATE_LIMITER === 'true';

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

const redisCluster = process.env.REDIS_CLUSTER === 'true';
let redisClient: Cluster | Redis | undefined;
const redisClusterOptions: ClusterOptions = {
  // slotsRefreshTimeout: 2000,
  redisOptions: {
    // tls: {}, // WARN: enabling tls would fail the client if not setup with correct params
    password: process.env.REDIS_PASSWORD,
  },
};

export const getRedisClient = () => {
  if (!redisClient) {
    if (redisCluster) {
      logger.info('Connecting to Redis Cluster');
      redisClient = new Cluster(redisNodes, redisClusterOptions);
    } else {
      logger.info('Connecting to single Redis node');
      redisClient = new Redis(redisNodes[0]);
    }
  }

  redisClient.on('error', (error) => {
    logger.error('Redis error:', error);
  });

  redisClient.on('connect', () => {
    logger.info('Connected to Redis Cluster successfully');
  });

  redisClient.on('close', () => {
    logger.info('Disconnected from Redis Cluster');
  });

  redisClient.on('reconnecting', () => {
    logger.info('Reconnecting to Redis Cluster');
  });

  redisClient.on('end', () => {
    logger.info('Redis Cluster connection ended');
  });

  redisClient.on('wait', () => {
    logger.info('Redis Cluster waiting for connection');
  });

  redisClient.on('select', (node) => {
    logger.info('Redis Cluster selected node:', node);
  });

  return redisClient;
};

export const pubClient = getRedisClient();

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

app.get('/', (_req, res) => {
  res.json({ success: true });
});

// Redirect /debug to /evt for backwards compatibility
app.post('/debug', (req, _res, next) => {
  req.url = '/evt'; // Redirect to /evt
  next(); // Pass control to the next handler (which will be /evt)
});

app.post('/evt', async (_req, res) => {
  try {
    const { body } = _req;

    if (!body.event) {
      logger.error(`Event is required`);
      return res.status(400).json({ error: 'event is required' });
    }

    if (!body.event.startsWith('sdk_')) {
      logger.error(`Wrong event name: ${body.event}`);
      return res.status(400).json({ error: 'wrong event name' });
    }

    logger.debug(`Received event /debug`, body);

    const id: string = body.id || 'socket.io-server';

    if (typeof id !== 'string') {
      return res.status(400).json({ status: 'error' });
    }

    let userIdHash = await pubClient.get(id);

    if (!userIdHash) {
      userIdHash = crypto.createHash('sha1').update(id).digest('hex');
      await pubClient.set(
        id,
        userIdHash,
        'EX',
        THIRTY_DAYS_IN_SECONDS.toString(),
      );
    }

    if (isDevelopment) {
      inspectRedis(id);
    }

    let userInfo;
    const cachedUserInfo = await pubClient.get(userIdHash);

    if (cachedUserInfo) {
      logger.debug(`Cached user info found for ${userIdHash}`, cachedUserInfo);
      userInfo = JSON.parse(cachedUserInfo);
    } else {
      // Initial userInfo setup
      userInfo = {
        url: '',
        title: '',
        platform: '',
        source: '',
        sdkVersion: '',
      };
    }

    // If 'sdk_connect_request_started', update userInfo in Redis
    if (body.event === 'sdk_connect_request_started') {
      userInfo = {
        url: body.url || '',
        title: body.title || '',
        platform: body.platform || '',
        source: body.source || '',
        sdkVersion: body.sdkVersion || '',
      };

      await pubClient.set(
        userIdHash,
        JSON.stringify(userInfo),
        'EX',
        THIRTY_DAYS_IN_SECONDS.toString(),
      );
    }

    if (isDevelopment) {
      inspectRedis(userIdHash);
    }

    const event = {
      userId: userIdHash,
      event: body.event,
      properties: {
        userId: userIdHash,
        ...body.properties,
        // Apply stored user info if available
        url: userInfo.url || body.originationInfo?.url,
        title: userInfo.title || body.originationInfo?.title,
        platform: userInfo.platform || body.originationInfo?.platform,
        sdkVersion:
          userInfo.sdkVersion || body.originationInfo?.sdkVersion || '',
        source: userInfo.source || body.originationInfo?.source || '',
      },
    };

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

    if (isDevelopment) {
      logger.debug('Event object:', event);
    }

    analytics.track(event, function (err: Error) {
      logger.info('Segment batch', { event });

      if (err) {
        logger.error('Segment error:', err);
      }
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
});

export { app, analytics };
