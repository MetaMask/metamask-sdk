require('dotenv').config();
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

// eslint-disable-next-line node/no-process-env
const isDevelopment = process.env.NODE_ENV === 'development';

const app = express();

const server = http.createServer(app);
const { Server } = require('socket.io');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 points
  duration: 1, // per second
});

const rateLimiterMesssage = new RateLimiterMemory({
  points: 50, // 5 points
  duration: 1, // per second
});

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
const cors = require('cors');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

const uuid = require('uuid');

const helmet = require('helmet');

const Analytics = require('analytics-node');

// eslint-disable-next-line node/no-process-env
const analytics = new Analytics(process.env.SEGMENT_API_KEY, {
  flushAt: isDevelopment ? 1 : 20,
  errorHandler: (err) => {
    console.error('Analytics-node flush failed.');
    console.error(err);
  },
});

app.use(helmet());
app.disable('x-powered-by');

app.get('/', (_req, res) => {
  res.json({ success: true });
});

if (!isDevelopment) {
  // flushes all Segment events when Node process is interrupted for any reason
  // https://segment.com/docs/connections/sources/catalog/libraries/server/node/#long-running-process
  const exitGracefully = async (code) => {
    console.log('Flushing events');
    await analytics.flush(function (err) {
      console.log('Flushed, and now this program can exit!');

      process.exitCode(code);
      if (err) {
        console.log(err);
      }
    });
  };

  [
    'beforeExit',
    'uncaughtException',
    'unhandledRejection',
    'SIGHUP',
    'SIGINT',
    'SIGQUIT',
    'SIGILL',
    'SIGTRAP',
    'SIGABRT',
    'SIGBUS',
    'SIGFPE',
    'SIGUSR1',
    'SIGSEGV',
    'SIGUSR2',
    'SIGTERM',
  ].forEach((evt) => process.on(evt, exitGracefully));
}

app.post('/debug', (_req, res) => {
  try {
    const { body } = _req;

    if (!body.event) {
      return res.status(400).json({ error: 'event is required' });
    }

    analytics.track(
      {
        userId: body.id || 'socket.io-server',
        event: body.event,
        ...(body.url && { url: body.url }),
        ...(body.title && { title: body.title }),
        ...(body.platform && { platform: body.platform }),
        ...(body.commLayer && { commLayer: body.commLayer }),
        ...(body.sdkVersion && { sdkVersion: body.sdkVersion }),
      },
      function (err) {
        if (err) {
          console.log(err);
        }
      },
    );

    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('create_channel', async (id) => {
    await rateLimiter.consume(socket.handshake.address);

    console.log('create channel', id);

    if (!uuid.validate(id)) {
      return socket.emit(`message-${id}`, { error: 'must specify a valid id' });
    }

    const room = io.sockets.adapter.rooms.get(id);
    if (!id) {
      return socket.emit(`message-${id}`, { error: 'must specify an id' });
    }

    if (room) {
      return socket.emit(`message-${id}`, { error: 'room already created' });
    }
    socket.join(id);
    return socket.emit(`channel_created-${id}`, id);
  });

  socket.on('message', async ({ id, message }) => {
    try {
      await rateLimiterMesssage.consume(socket.handshake.address);
    } catch (e) {
      return;
    }

    socket.to(id).emit(`message-${id}`, { id, message });
  });

  socket.on('join_channel', async (id) => {
    try {
      await rateLimiter.consume(socket.handshake.address);
    } catch (e) {
      return;
    }

    console.log('join_channel', id);

    if (!uuid.validate(id)) {
      socket.emit(`message-${id}`, { error: 'must specify a valid id' });
      return;
    }

    const room = io.sockets.adapter.rooms.get(id);
    if (room && room.size > 2) {
      socket.emit(`message-${id}`, { error: 'room already full' });
      io.sockets.in(id).socketsLeave(id);
      return;
    }

    socket.join(id);

    if (!room || room.size < 2) {
      socket.emit(`clients_waiting_to_join-${id}`, room ? room.size : 1);
    }

    socket.on('disconnect', function (error) {
      console.log('disconnected', error);
      io.sockets.in(id).emit(`clients_disconnected-${id}`, error);
      // io.sockets.in(id).socketsLeave(id);
    });

    if (room && room.size === 2) {
      io.sockets.in(id).emit(`clients_connected-${id}`, id);
    }
  });

  socket.on('leave_channel', (id) => {
    socket.leave(id);
    io.sockets.in(id).emit(`clients_disconnected-${id}`);
  });
});

// eslint-disable-next-line node/no-process-env
const port = process.env.port || 4000;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
