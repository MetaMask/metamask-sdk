/* eslint-disable node/no-process-env */
require('dotenv').config();

const crypto = require('crypto');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { LRUCache } = require('lru-cache');
const cors = require('cors');
const uuid = require('uuid');
const helmet = require('helmet');
const Analytics = require('analytics-node');
const { Server } = require('socket.io');

const {
  rateLimiter,
  rateLimiterMesssage,
  resetRateLimits,
  increaseRateLimits,
  setLastConnectionErrorTimestamp,
} = require('./rate-limiter');

const isDevelopment = process.env.NODE_ENV === 'development';

const userIdHashCache = new LRUCache({
  max: 5000,
  maxAge: 1000 * 60 * 60 * 24,
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

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

io.on('connection', (socket) => {
  const socketId = socket.id;
  const clientIp = socket.request.socket.remoteAddress;
  console.log('INFO> a user connected');

  if (isDevelopment) {
    console.log(`DEBUG> socketId=${socketId} clientIp=${clientIp}`);
  }

  socket.on('create_channel', async (id) => {
    try {
      await rateLimiter.consume(socket.handshake.address);

      if (isDevelopment) {
        console.log('DEBUG> create channel', id);
      }

      if (!uuid.validate(id)) {
        return socket.emit(`message-${id}`, {
          error: 'must specify a valid id',
        });
      }

      const room = io.sockets.adapter.rooms.get(id);
      if (!id) {
        return socket.emit(`message-${id}`, { error: 'must specify an id' });
      }

      if (room) {
        return socket.emit(`message-${id}`, { error: 'room already created' });
      }

      resetRateLimits();

      socket.join(id);
      return socket.emit(`channel_created-${id}`, id);
    } catch (error) {
      setLastConnectionErrorTimestamp(Date.now());
      increaseRateLimits(90, 0);
      console.error('ERROR> Error on create_channel:', error);
      // emit an error message back to the client, if appropriate
      return socket.emit(`error`, { error: error.message });
    }
  });

  socket.on('message', async ({ id, message, context, plaintext }) => {
    try {
      await rateLimiterMesssage.consume(socket.handshake.address);

      if (isDevelopment) {
        // Minify encrypted message for easier readibility
        let displayMessage = message;
        if (plaintext) {
          displayMessage = 'AAAAAA_ENCRYPTED_AAAAAA';
        }

        if (context === 'mm-mobile') {
          console.log(`DEBUG> \x1b[33m message-${id} -> \x1b[0m`, {
            id,
            context,
            displayMessage,
            plaintext,
          });
        } else {
          console.log(`DEBUG> message-${id} -> `, {
            id,
            context,
            displayMessage,
            plaintext,
          });
        }
      }

      resetRateLimits();

      return socket.to(id).emit(`message-${id}`, { id, message });
    } catch (error) {
      setLastConnectionErrorTimestamp(Date.now());
      increaseRateLimits(90, 0);
      console.error(`ERROR> Error on message: ${error}`);
      // emit an error message back to the client, if appropriate
      return socket.emit(`message-${id}`, { error: error.message });
    }
  });

  socket.on('ping', async ({ id, message, context }) => {
    try {
      await rateLimiterMesssage.consume(socket.handshake.address);

      if (isDevelopment) {
        console.log(`DEBUG> ping-${id} -> `, { id, context, message });
      }
      socket.to(id).emit(`ping-${id}`, { id, message });
    } catch (error) {
      console.error('ERROR> Error on ping:', error);
      // emit an error message back to the client, if appropriate
      socket.emit(`ping-${id}`, { error: error.message });
    }
  });

  socket.on('join_channel', async (id, test) => {
    try {
      await rateLimiter.consume(socket.handshake.address);
    } catch (e) {
      return;
    }

    if (isDevelopment) {
      console.log(`DEBUG> join_channel ${id} ${test}`);
    }

    if (!uuid.validate(id)) {
      socket.emit(`message-${id}`, { error: 'must specify a valid id' });
      return;
    }

    const room = io.sockets.adapter.rooms.get(id);
    if (isDevelopment) {
      console.log(`DEBUG> join_channel ${id} room.size=${room && room.size}`);
    }

    if (room && room.size > 2) {
      if (isDevelopment) {
        console.log(`DEBUG> join_channel ${id} room already full`);
      }
      socket.emit(`message-${id}`, { error: 'room already full' });
      io.sockets.in(id).socketsLeave(id);
      return;
    }

    socket.join(id);

    if (!room || room.size < 2) {
      socket.emit(`clients_waiting_to_join-${id}`, room ? room.size : 1);
    }

    socket.on('disconnect', function (error) {
      if (isDevelopment) {
        console.log(`DEBUG> disconnect event channel=${id}: `, error);
      }

      io.sockets.in(id).emit(`clients_disconnected-${id}`, error);
      // io.sockets.in(id).socketsLeave(id);
    });

    if (room && room.size === 2) {
      io.sockets.in(id).emit(`clients_connected-${id}`, id);
    }
  });

  socket.on('leave_channel', (id) => {
    if (isDevelopment) {
      console.log(`DEBUG> leave_channel id=${id}`);
    }

    socket.leave(id);
    io.sockets.in(id).emit(`clients_disconnected-${id}`);
  });
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
