/* eslint-disable node/no-process-env */
require('dotenv').config();

const http = require('http');

const { app, analytics } = require('./api-config');
const configureSocketIO = require('./socket-config');

const isDevelopment = process.env.NODE_ENV === 'development';

const server = http.createServer(app);
configureSocketIO(server); // configure socket.io server

console.log('INFO> isDevelopment?', isDevelopment);

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
