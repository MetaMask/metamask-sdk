const readline = require('readline');
const { io } = require('socket.io-client');

/** @type {string} */
const socketServer = process.env.SOCKET_SERVER || 'http://localhost:4000';

/**
 * Main application function
 * @returns {Promise<void>}
 */
const main = async () => {
  /** @type {import('socket.io-client').Socket} */
  const socket = io(socketServer, {
    transports: ['websocket'],
    autoConnect: true,
    withCredentials: true,
  });

  /**
   * Handles user input for room commands
   * @returns {void}
   */
  const waitForRoomInput = () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter command: ', (command) => {
      // command format: <command> <args>
      // join <room_id>
      // create <room_id>
      // check <room_id>
      // message <room_id> <message>

      // parse command
      const [cmd, ...args] = command.split(' ');
      if (cmd === 'join') {
        const [roomId] = args;
        socket.emit('join_channel', roomId);
        console.log(`Joined room: ${roomId}`);
      } else if (cmd === 'leave') {
        const [roomId] = args;
        socket.emit('leave_channel', roomId);
        console.log(`Left room: ${roomId}`);
      } else if (cmd === 'check') {
        const [roomId] = args;
        /**
         * @param {unknown} result
         */
        socket.emit('check_room', roomId, (result) => {
          console.log(`Check room ${roomId} -> ${result} `);
        });
      } else if (cmd === 'create') {
        const [roomId] = args;
        socket.emit('create_channel', roomId);
        console.log(`Created room: ${roomId}`);
      } else if (cmd === 'message') {
        const [roomId, message] = args;
        socket.emit('message', { id: roomId, message });
        console.log(`Sent message: ${message} to room: ${roomId}`);
      } else {
        console.log(`Unknown command: ${command}`);
      }

      rl.close();
      waitForRoomInput(); // Keep waiting for more room inputs
    });
  };

  /**
   * Logs all socket events
   * @param {string} event - The event name
   * @param {...any} args - Event arguments
   */
  socket.onAny((event, ...args) => {
    console.log(`socket.onAny event=${event}`, args);
  });

  socket.on('connect', () => {
    console.log('Connected to the server');
    waitForRoomInput();
  });

  /**
   * Handles socket disconnection
   * @param {string} reason - Reason for disconnection
   */
  socket.on('disconnect', (reason) => {
    console.log(`Disconnected: ${reason}`);
    // Optional: Implement reconnection logic here if needed
  });

  // Handle connection errors
  /**
   * @param {Error} error - Connection error
   */
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  // Keep the process alive
  process.stdin.resume();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});