/* eslint-disable import/first */
import http from 'http';
import dotenv from 'dotenv';

// Dotenv must be loaded before importing local files
dotenv.config();

import { instrument } from '@socket.io/admin-ui';
import { analytics, app } from './api-config';
import { logger } from './logger';
import { extractMetrics } from './metrics';
import { configureSocketServer } from './socket-config';
import { cleanupAndExit } from './utils';
import { isDevelopment, withAdminUI } from './config';

const server = http.createServer(app);

// Register event listeners for process termination events
process.on('SIGINT', async () => {
  await cleanupAndExit(server, analytics);
});

process.on('SIGTERM', async () => {
  await cleanupAndExit(server, analytics);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

configureSocketServer(server)
  .then((ioServer) => {
    logger.info(
      `socker.io server started development=${isDevelopment} adminUI=${withAdminUI}`,
    );

    if (withAdminUI) {
      logger.info(`Starting socket.io admin ui`);
      instrument(ioServer, {
        auth: false,
        namespaceName: 'admin',
        mode: 'development',
      });
    }

    // Make sure to protect the endpoint to be only available within the cluster for prometheus
    app.get('/metrics', async (_req, res) => {
      res.set('Content-Type', 'text/plain');
      const metrics = extractMetrics({ ioServer });
      res.send(metrics);
    });

    const port: number = Number(process.env.PORT) || 4000;
    server.listen(port, () => {
      logger.info(`INFO> listening on *:${port}`);
    });
  })
  .catch((err) => {
    logger.error(`ERROR> socket.io error: ${err}`);
  });
