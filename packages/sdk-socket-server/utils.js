// flushes all Segment events when Node process is interrupted for any reason
// https://segment.com/docs/connections/sources/catalog/libraries/server/node/#long-running-process
const exitGracefully = async (code, analytics) => {
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
const cleanupAndExit = async (server, analytics) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  try {
    // Close the server
    await server.close();
    console.log('INFO> Server closed.');

    // Perform any other necessary cleanup operations
    exitGracefully(0, analytics);
  } catch (err) {
    console.error('ERROR> Error during server shutdown:', err);
    // eslint-disable-next-line node/no-process-exit
    process.exit(1);
  }
};

module.exports = {
  exitGracefully,
  cleanupAndExit,
};
