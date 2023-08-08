const { Server } = require('socket.io');
const uuid = require('uuid');
const { rateLimiter, rateLimiterMessage } = require('./rate-limiter');

const { isDevelopment } = require('./utils');
const { ErrorCategories, emitError } = require('./errorHandler');

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    const socketId = socket.id;
    const clientIp =
      socket.request.headers['x-forwarded-for'] ||
      socket.request.socket.remoteAddress;

    console.log('INFO> a user connected');

    if (isDevelopment) {
      console.log(`DEBUG> socketId=${socketId} clientIp=${clientIp}`);
    }

    socket.on('create_channel', async (id) => {
      try {
        await rateLimiter.consume(clientIp);

        if (isDevelopment) {
          console.log('DEBUG> create channel', id);
        }

        if (!uuid.validate(id)) {
          return emitError(
            socket,
            id,
            'Must specify a valid id',
            ErrorCategories.VALIDATION,
          );
        }

        const room = io.sockets.adapter.rooms.get(id);
        if (!id) {
          return emitError(
            socket,
            id,
            'Must specify an id',
            ErrorCategories.VALIDATION,
          );
        }

        if (room) {
          return emitError(
            socket,
            id,
            'Room already created',
            ErrorCategories.VALIDATION,
          );
        }

        socket.join(id);
        return socket.emit(`channel_created-${id}`, id);
      } catch (error) {
        console.error('ERROR> Error on create_channel:', error);
        return emitError(
          socket,
          id,
          `create_channel: ${error.message}`,
          ErrorCategories.SERVER,
        );
      }
    });

    socket.on('message', async ({ id, message, context, plaintext }) => {
      try {
        await rateLimiterMessage.consume(clientIp);

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

        return socket.to(id).emit(`message-${id}`, { id, message });
      } catch (error) {
        console.error(`ERROR> Error on message: ${error}`);
        return emitError(
          socket,
          id,
          `message: ${error.message}`,
          ErrorCategories.MESSAGE,
        );
      }
    });

    socket.on('ping', async ({ id, message, context }) => {
      try {
        await rateLimiterMessage.consume(clientIp);

        if (isDevelopment) {
          console.log(`DEBUG> ping-${id} -> `, { id, context, message });
        }
        socket.to(id).emit(`ping-${id}`, { id, message });
      } catch (error) {
        console.error('ERROR> Error on ping:', error);
        emitError(socket, id, `ping: ${error.message}`, ErrorCategories.PING);
      }
    });

    socket.on('join_channel', async (id, test) => {
      try {
        await rateLimiter.consume(clientIp);
      } catch (e) {
        emitError(
          socket,
          id,
          'Rate limit exceeded',
          ErrorCategories.RATE_LIMIT,
        );
      }

      if (!uuid.validate(id)) {
        emitError(
          socket,
          id,
          'Must specify a valid id',
          ErrorCategories.VALIDATION,
        );
      }

      const room = io.sockets.adapter.rooms.get(id);
      if (isDevelopment) {
        console.log(`DEBUG> join_channel ${id} room.size=${room && room.size}`);
        console.log(`DEBUG> join_channel ${id} ${test}`);
      }

      if (room && room.size > 2) {
        if (isDevelopment) {
          console.log(`DEBUG> join_channel ${id} room already full`);
        }
        emitError(socket, id, 'Room already full', ErrorCategories.VALIDATION);
        io.sockets.in(id).socketsLeave(id);
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

  return io;
};
