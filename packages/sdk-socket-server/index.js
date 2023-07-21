/* eslint-disable node/no-process-env */
require('dotenv').config();

const crypto = require('crypto');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { LRUCache } = require('lru-cache');
const cors = require('cors');
const helmet = require('helmet');
const Analytics = require('analytics-node');

const configureSocketIO = require('./socket-config');

const isDevelopment = process.env.NODE_ENV === 'development';

const userIdHashCache = new LRUCache({
  max: 5000,
  maxAge: 1000 * 60 * 60 * 24,
});

const app = express();
const server = http.createServer(app);
configureSocketIO(server); // configure socket.io server

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

console.log('INFO> isDevelopment?', isDevelopment);

const analytics = new Analytics(
  isDevelopment
    ? process.env.SEGMENT_API_KEY_DEBUG
    : process.env.SEGMENT_API_KEY_PRODUCTION,
  {
    flushInterval: isDevelopment ? 1000 : 10000,
    errorHandler: (err) => {
      console.error(`ERROR> Analytics-node flush failed: ${err}`);
    },
  },
);

app.use(helmet());
app.disable('x-powered-by');

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

// flushes all Segment events when Node process is interrupted for any reason
// https://segment.com/docs/connections/sources/catalog/libraries/server/node/#long-running-process
const exitGracefully = async (code) => {
  console.log('INFO> Flushing events');
  try {
    await analytics.flush(function (err) {
      console.log('INFO> Flushed, and now this program can exit!');
      if (err) {
        console.error(`ERROR> ${err}`);
      }
    });
  } catch (error) {
    console.error('ERROR> Error on exitGracefully:', error);
  }
  // eslint-disable-next-line node/no-process-exit
  process.exit(code);
};

// Define a variable to track if the server is shutting down
let isShuttingDown = false;

// Function to perform cleanup operations before shutting down
const cleanupAndExit = async () => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  try {
    // Close the server
    await server.close();
    console.log('INFO> Server closed.');

    // Perform any other necessary cleanup operations
    exitGracefully(0);
  } catch (err) {
    console.error('ERROR> Error during server shutdown:', err);
    // eslint-disable-next-line node/no-process-exit
    process.exit(1);
  }
};

// Register event listeners for process termination events
process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);

const port = process.env.port || 4000;
server.listen(port, () => {
  console.log(`INFO> listening on *:${port}`);
});
