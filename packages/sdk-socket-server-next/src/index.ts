/* eslint-disable import/first */
import http from 'http';
import dotenv from 'dotenv';

// Dotenv must be loaded before importing local files
dotenv.config();

// Load config
import { instrument } from '@socket.io/admin-ui';
import packageJson from '../package.json';
import { isDevelopment, withAdminUI } from './config';
import { analytics, app } from './api-config';
import { getLogger } from './logger';
import { extractMetrics } from './metrics';
import { configureSocketServer } from './socket-config';
import { cleanupAndExit } from './utils';

const server = http.createServer(app);
const logger = getLogger();

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

    app.get('/version', (_req, res) => {
      res.send({ version: packageJson.version });
    });

    const port: number = Number(process.env.PORT) || 4000;
    server.listen(port, () => {
      logger.info(`INFO> listening on *:${port}`);
    });
  })
  .catch((err) => {
    logger.error(`ERROR> socket.io error: ${err}`);
  });
