const http = require('http');
const express = require('express');

const app = express();

const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
const cors = require('cors');

app.use(cors());

app.get('/', (req, res) => {
  res.json({ success: true });
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('create_channel', (id) => {
    console.log('create channel', id);
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

  socket.on('message', ({ id, message }) => {
    socket.to(id).emit(`message-${id}`, { id, message });
  });

  socket.on('join_channel', (id) => {
    console.log('join_channel', id);

    const room = io.sockets.adapter.rooms.get(id);

    if (room && room.size > 2) {
      socket.emit(`message-${id}`, { error: 'room already full' });
      return io.sockets.in(id).socketsLeave(id);
    }

    socket.join(id);

    socket.on('disconnect', function () {
      console.log('disconnected');
      io.sockets.in(id).emit(`clients_disconnected-${id}`);
      io.sockets.in(id).socketsLeave(id);
    });

    if (room && room.size === 2) {
      socket.to(id).emit(`clients_connected-${id}`, id);
    }
    return true;
  });
});

// eslint-disable-next-line node/no-process-env
const port = process.env.port || 4000;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
