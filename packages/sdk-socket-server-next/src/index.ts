/* eslint-disable import/first */
import http from 'http';
import dotenv from 'dotenv';

// Dotenv must be loaded before importing local files
dotenv.config();

import { analytics, app } from './api-config';
import { logger } from './logger';
import { cleanupAndExit } from './utils';
import { configureSocketServer } from './socket-config';
import { extractMetrics } from './metrics';

export const isDevelopment: boolean = process.env.NODE_ENV === 'development';
export const isDevelopmentServer: boolean =
  process.env.ENVIRONMENT === 'development';

const server = http.createServer(app);

configureSocketServer(server)
  .then((ioServer) => {
    logger.info('INFO> isDevelopment?', isDevelopment);

    // Register event listeners for process termination events
    process.on('SIGINT', async () => {
      await cleanupAndExit(server, analytics);
    });

    process.on('SIGTERM', async () => {
      await cleanupAndExit(server, analytics);
    });

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
