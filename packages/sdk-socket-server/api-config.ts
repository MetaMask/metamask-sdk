/* eslint-disable node/no-process-env */
import crypto from 'crypto';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { LRUCache } from 'lru-cache';
import Analytics from 'analytics-node';

const isDevelopment: boolean = process.env.NODE_ENV === 'development';
const isDevelopmentServer: boolean = process.env.ENVIRONMENT === 'development';

const userIdHashCache = new LRUCache<string, string>({
  max: 5000,
  ttl: 1000 * 60 * 60 * 24,
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(helmet());
app.disable('x-powered-by');

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

app.post('/debug', (_req, res) => {
  try {
    const { body } = _req;

    if (!body.event) {
      return res.status(400).json({ error: 'event is required' });
    }

    if (!body.event.startsWith('sdk_')) {
      return res.status(400).json({ error: 'wrong event name' });
    }

    const id: string = body.id || 'socket.io-server';
    let userIdHash: string | undefined = userIdHashCache.get(id);

    if (!userIdHash) {
      userIdHash = crypto.createHash('sha1').update(id).digest('hex');
      userIdHashCache.set(id, userIdHash);
    }

    const event: {
      userId: string;
      event: string;
      properties: {
        userId: string;
        [key: string]: string | undefined; // This line adds an index signature
      };
    } = {
      userId: userIdHash,
      event: body.event,
      properties: {
        userId: userIdHash,
      },
    };

    // Define properties to be excluded
    const propertiesToExclude: string[] = ['icon'];

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
