import { Server as HttpServer } from 'http';

interface FlushResponse {
  batch: any;
  timestamp: string;
  sentAt: string;
}

interface Analytics {
  flush(callback: (err: Error | null) => void): Promise<FlushResponse>;
}

// Function to exit gracefully
const exitGracefully = async (
  code: number,
  analytics: Analytics,
): Promise<void> => {
  console.log('INFO> Flushing events');
  try {
    await analytics.flush((err) => {
      console.log('INFO> Flushed, and now this program can exit!');
      if (err) {
        console.error(`ERROR> ${err}`);
      }
    });
  } catch (error) {
    console.error('ERROR> Error on exitGracefully:', error);
  }
  process.exit(code);
};

// Define a variable to track if the server is shutting down
let isShuttingDown = false;

/// Update the Server interface to match the actual server object
type Server = HttpServer;

const cleanupAndExit = async (
  server: Server,
  analytics: Analytics,
): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  try {
    // Close the server
    server.close(() => {
      console.log('INFO> Server closed.');
      // Perform any other necessary cleanup operations
      exitGracefully(0, analytics).catch((err) => {
        console.error('ERROR> Error during server shutdown:', err);
        process.exit(1);
      });
    });
  } catch (err) {
    console.error('ERROR> Error during server shutdown:', err);
    process.exit(1);
  }
};

export { exitGracefully, cleanupAndExit };
