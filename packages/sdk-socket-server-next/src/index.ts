/* eslint-disable import/first */
import http from 'http';
import dotenv from 'dotenv';

// Dotenv must be loaded before importing local files
dotenv.config();

// Load config
import { instrument } from '@socket.io/admin-ui';
import { isDevelopment, withAdminUI } from './config';
import { app } from './app';
import { getLogger } from './logger';
import { configureSocketServer } from './socket-config';
import { cleanupAndExit } from './utils';

const server = http.createServer(app);
const logger = getLogger();

// Register event listeners for process termination events
process.on('SIGINT', async () => {
  await cleanupAndExit(server);
});

process.on('SIGTERM', async () => {
  await cleanupAndExit(server);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

configureSocketServer(server)
  .then((ioServer) => {
    logger.info(
      `socket.io server started development=${isDevelopment} adminUI=${withAdminUI}`,
    );

    if (withAdminUI) {
      logger.info(`Starting socket.io admin ui`);
      instrument(ioServer, {
        auth: false,
        namespaceName: 'admin',
        mode: 'development',
      });
    }

    const port: number = Number(process.env.PORT) || 4000;
    server.listen(port, () => {
      logger.info(`listening on *:${port}`);
    });
  })
  .catch((err) => {
    logger.error(`socket.io error: ${err}`);
  });
