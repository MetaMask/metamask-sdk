const http = require('http');
const express = require('express');

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

app.use(cors());

const uuid = require('uuid');

const helmet = require('helmet');

app.use(helmet());
app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.json({ success: true });
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
      return socket.emit(`message-${id}`, { error: 'must specify a valid id' });
    }

    const room = io.sockets.adapter.rooms.get(id);
    if (room && room.size > 2) {
      socket.emit(`message-${id}`, { error: 'room already full' });
      return io.sockets.in(id).socketsLeave(id);
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
    return true;
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
