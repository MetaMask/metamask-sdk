/* eslint-disable node/no-process-env */
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { LRUCache } = require('lru-cache');
const Analytics = require('analytics-node');
const { isDevelopment } = require('./utils');

const userIdHashCache = new LRUCache({
  max: 5000,
  maxAge: 1000 * 60 * 60 * 24,
});

const app = express();

if (isDevelopment) {
  // Log the worker ID with every request
  app.use((req, _res, next) => {
    console.log(
      `Worker ${process.pid} received request for ${req.method} ${req.originalUrl}`,
    );
    next();
  });
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(helmet());
app.disable('x-powered-by');

let analytics;

const apiKey = isDevelopment
  ? process.env.SEGMENT_API_KEY_DEBUG
  : process.env.SEGMENT_API_KEY_PRODUCTION;

// eslint-disable-next-line no-negated-condition
if (!apiKey) {
  console.warn(
    'WARNING> No API key provided for Analytics. Analytics will be disabled.',
  );

  // Mocking the Analytics methods you might use in the app.
  analytics = {
    // eslint-disable-next-line no-empty-function
    track: () => {},
  };
} else {
  analytics = new Analytics(apiKey, {
    flushInterval: isDevelopment ? 1000 : 10000,
    errorHandler: (err) => {
      console.error(`ERROR> Analytics-node flush failed: ${err}`);
    },
  });
}

app.get('/', (_req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
});

app.post('/debug', (_req, res) => {
  console.log('CALLED');
  try {
    const { body } = _req;

    if (!body.event) {
      return res.status(400).json({ error: 'event is required' });
    }

    if (!body.event.startsWith('sdk_')) {
      return res.status(400).json({ error: 'wrong event name' });
    }

    const id = body.id || 'socket.io-server';
    let userIdHash = userIdHashCache.get(id);

    if (!userIdHash) {
      userIdHash = crypto.createHash('sha1').update(id).digest('hex');
      userIdHashCache.set(id, userIdHash);
    }

    const event = {
      userId: userIdHash,
      event: body.event,
      properties: {
        userId: userIdHash,
      },
    };

    for (const property in body) {
      if (
        Object.prototype.hasOwnProperty.call(body, property) &&
        body[property]
      ) {
        event.properties[property] = body[property];
      }
    }

    if (isDevelopment) {
      console.log('DEBUG> Event object:', event);
    }

    analytics.track(event, function (err, batch) {
      if (isDevelopment) {
        console.log('DEBUG> Segment batch', batch);
      }

      if (err) {
        console.error('ERROR: Segment error:', err);
      }
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
});

module.exports = { app, analytics };
