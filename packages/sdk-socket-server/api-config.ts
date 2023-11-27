/* eslint-disable node/no-process-env */
import crypto from 'crypto';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import Redis from 'ioredis';
import Analytics from 'analytics-node';
import { isDevelopment, isDevelopmentServer } from '.';

// Initialize Redis client
// Provide a default URL if REDIS_URL is not set
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(redisUrl);
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60; // expiration time of entries in Redis

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(helmet());
app.disable('x-powered-by');

async function inspectRedis(key?: string) {
  if (key) {
    const value = await redis.get(key);
    console.log(`DEBUG> Redis Update - Key: ${key}, Value: ${value}`);
    return;
  }
  return;
}

const analytics = new Analytics(
  isDevelopment || isDevelopmentServer
    ? process.env.SEGMENT_API_KEY_DEBUG || ''
    : process.env.SEGMENT_API_KEY_PRODUCTION || '',
  {
    flushInterval: isDevelopment ? 1000 : 10000,
    errorHandler: (err: Error) => {
      console.error(`ERROR> Analytics-node flush failed: ${err}`);
    },
  },
);

app.get('/', (_req, res) => {
  res.json({ success: true });
});

app.post('/debug', async (_req, res) => {
  try {
    const { body } = _req;

    if (!body.event) {
      return res.status(400).json({ error: 'event is required' });
    }

    if (!body.event.startsWith('sdk_')) {
      return res.status(400).json({ error: 'wrong event name' });
    }

    const id: string = body.id || 'socket.io-server';
    let userIdHash = await redis.get(id);

    if (!userIdHash) {
      userIdHash = crypto.createHash('sha1').update(id).digest('hex');
      await redis.set(id, userIdHash, 'EX', THIRTY_DAYS_IN_SECONDS);
    }

    if (isDevelopment) {
      inspectRedis(id);
    }

    let userInfo;
    const cachedUserInfo = await redis.get(userIdHash);

    if (cachedUserInfo) {
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
      await redis.set(
        userIdHash,
        JSON.stringify(userInfo),
        'EX',
        THIRTY_DAYS_IN_SECONDS,
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
      console.log('DEBUG> Event object:', event);
    }

    analytics.track(event, function (err: Error) {
      console.log('INFO> Segment batch');

      if (err) {
        console.error('ERROR: Segment error:', err);
      }
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
});

export { app, analytics };
