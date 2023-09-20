/* eslint-disable node/no-process-env */
const { Server } = require('socket.io');
const uuid = require('uuid');
const {
  rateLimiter,
  rateLimiterMesssage,
  resetRateLimits,
  increaseRateLimits,
  setLastConnectionErrorTimestamp,
} = require('./rate-limiter');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('INFO> connection');

    const socketId = socket.id;
    const clientIp = socket.request.socket.remoteAddress;

    if (isDevelopment) {
      console.log(`DEBUG> socketId=${socketId} clientIp=${clientIp}`);
    }

    socket.on('create_channel', async (id) => {
      console.log('INFO> create_channel');

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
          return socket.emit(`message-${id}`, {
            error: 'room already created',
          });
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
      const isMobile = context === 'mm-mobile';
      console.log(`INFO> message' ${isMobile ? ' mobile' : ''}`);

      try {
        await rateLimiterMesssage.consume(socket.handshake.address);

        if (isDevelopment) {
          // Minify encrypted message for easier readibility
          let displayMessage = message;
          if (plaintext) {
            displayMessage = 'AAAAAA_ENCRYPTED_AAAAAA';
          }

          if (isMobile) {
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
      console.log('INFO> ping');

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
      console.log('INFO> join_channel');

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
        console.log('INFO> disconnect');

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
      console.log('INFO> leave_channel');

      if (isDevelopment) {
        console.log(`DEBUG> leave_channel id=${id}`);
      }

      socket.leave(id);
      io.sockets.in(id).emit(`clients_disconnected-${id}`);
    });

    socket.on('check_room', (id, callback) => {
      console.log('INFO> check_room');

      if (isDevelopment) {
        console.log(`DEBUG> check_room id=${id}`);
      }

      if (!uuid.validate(id)) {
        return callback(new Error('must specify a valid id'), null);
      }

      const room = io.sockets.adapter.rooms.get(id);
      const occupancy = room ? room.size : 0;

      if (isDevelopment) {
        console.log(`DEBUG> check_room id=${id} occupancy=${occupancy}`);
      }

      // Callback with null as the first argument, meaning "no error"
      return callback(null, { occupancy });
    });
  });

  return io;
};
