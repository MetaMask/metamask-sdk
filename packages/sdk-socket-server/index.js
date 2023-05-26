/* eslint-disable node/no-process-env */
require('dotenv').config();
const crypto = require('crypto');
const http = require('http');
const fastify = require('fastify')({ logger: true });
const LRU = require('lru-cache');

const isDevelopment = process.env.NODE_ENV === 'development';

const userIdHashCache = new LRU({
  max: 5000,
  maxAge: 1000 * 60 * 60 * 24,
});

const server = http.createServer(fastify);
const { Server } = require('socket.io');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 1,
});

const rateLimiterMesssage = new RateLimiterMemory({
  points: 50,
  duration: 1,
});

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

fastify.register(require('fastify-cors'), {
  origin: '*',
});

fastify.register(require('fastify-helmet'));
fastify.register(require('fastify-formbody'));

const uuid = require('uuid');

const Analytics = require('analytics-node');

console.log('isDevelopment?', isDevelopment);

const analytics = new Analytics(
  isDevelopment
    ? process.env.SEGMENT_API_KEY_DEBUG
    : process.env.SEGMENT_API_KEY_PRODUCTION,
  {
    flushInterval: isDevelopment ? 1000 : 10000,
    errorHandler: (err) => {
      console.error('Analytics-node flush failed.');
      console.error(err);
    },
  },
);

fastify.get('/', async (_request, reply) => {
  reply.code(200).send({ success: true });
});

fastify.post('/debug', async (request, reply) => {
  try {
    const { body } = request;

    if (!body.event) {
      return reply.status(400).send({ error: 'event is required' });
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
    };

    const properties = [
      'url',
      'title',
      'platform',
      'commLayer',
      'commLayerVersion',
      'sdkVersion',
      'walletVersion',
    ];

    for (const property of properties) {
      if (body[property]) {
        event[property] = body[property];
      }
    }

    analytics.track(event, function (err, batch) {
      if (isDevelopment) {
        console.log(batch);
      }

      if (err) {
        console.log(err);
      }
    });

    return reply.send({ success: true });
  } catch (error) {
    return reply.send({ error });
  }
});

io.on('connection', (socket) => {
  const socketId = socket.id;
  const clientIp = socket.request.socket.remoteAddress;
  console.log('a user connected');
  if (isDevelopment) {
    console.log(`socketId=${socketId} clientIp=${clientIp}`);
  }

  socket.on('create_channel', async (id) => {
    if (!uuid.validate(id)) {
      return socket.emit(`message-${id}`, { error: 'must specify a valid id' });
    }

    await rateLimiter.consume(socket.handshake.address);

    if (isDevelopment) {
      console.log('create channel', id);
    }

    const room = io.sockets.adapter.rooms.get(id);

    if (room) {
      return socket.emit(`message-${id}`, { error: 'room already created' });
    }

    socket.join(id);
    socket.emit(`channel_created-${id}`, id);
  });

  socket.on('message', async ({ id, message, context, plaintext }) => {
    try {
      await rateLimiterMesssage.consume(socket.handshake.address);
    } catch (e) {
      return;
    }

    if (isDevelopment) {
      // Minify encrypted message for easier readability
      let displayMessage = message;
      if (plaintext) {
        displayMessage = 'AAAAAA_ENCRYPTED_AAAAAA';
      }

      const logMessage =
        context === 'mm-mobile'
          ? `\x1b[33m message-${id} -> \x1b[0m`
          : `message-${id} -> `;

      console.log(logMessage, { id, context, displayMessage, plaintext });
    }

    socket.to(id).emit(`message-${id}`, { id, message });
  });

  socket.on('ping', async ({ id, message, context }) => {
    try {
      await rateLimiterMesssage.consume(socket.handshake.address);
    } catch (e) {
      return;
    }

    if (isDevelopment) {
      console.log(`ping-${id} -> `, { id, context, message });
    }

    socket.to(id).emit(`ping-${id}`, { id, message });
  });

  socket.on('join_channel', async (id, test) => {
    if (!uuid.validate(id)) {
      return socket.emit(`message-${id}`, { error: 'must specify a valid id' });
    }

    try {
      await rateLimiter.consume(socket.handshake.address);
    } catch (e) {
      return null;
    }

    if (isDevelopment) {
      console.log(`join_channel ${id} ${test}`);
    }

    const room = io.sockets.adapter.rooms.get(id);

    if (room && room.size > 2) {
      if (isDevelopment) {
        console.log(`join_channel ${id} room already full`);
      }
      return socket.emit(`message-${id}`, { error: 'room already full' });
    }

    socket.join(id);

    if (!room || room.size < 2) {
      socket.emit(`clients_waiting_to_join-${id}`, room ? room.size : 1);
    }

    socket.on('disconnect', (error) => {
      if (isDevelopment) {
        console.log(`disconnect event channel=${id}: `, error);
      }
      io.sockets.in(id).emit(`clients_disconnected-${id}`, error);
    });

    if (room && room.size === 2) {
      io.sockets.in(id).emit(`clients_connected-${id}`, id);
    }
  });

  socket.on('leave_channel', (id) => {
    if (isDevelopment) {
      console.log(`leave_channel id=${id}`);
    }

    socket.leave(id);
    io.sockets.in(id).emit(`clients_disconnected-${id}`);
  });
});

const port = process.env.port || 4000;

// flushes all Segment events when Node process is interrupted for any reason
// https://segment.com/docs/connections/sources/catalog/libraries/server/node/#long-running-process
const exitGracefully = async (code) => {
  console.log('Flushing events');
  await analytics.flush(function (err) {
    console.log('Flushed, and now this program can exit!');

    if (err) {
      console.log(err);
    }
    // eslint-disable-next-line node/no-process-exit
    process.exit(code);
  });
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
    console.log('Server closed.');

    // Perform any other necessary cleanup operations
    exitGracefully(0);
  } catch (err) {
    console.error('Error during server shutdown:', err);
    // eslint-disable-next-line node/no-process-exit
    process.exit(1);
  }
};

// Register event listeners for process termination events
process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);

const start = async () => {
  try {
    await fastify.listen(port);
    console.log(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    console.error('Error starting the server:', err);
    // eslint-disable-next-line node/no-process-exit
    process.exit(1);
  }
};

start();
