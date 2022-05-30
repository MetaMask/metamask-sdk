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
