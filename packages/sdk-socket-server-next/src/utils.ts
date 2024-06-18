import { Server as HttpServer } from 'http';
import { logger } from './logger';

export type FlushResponse = {
  batch: any;
  timestamp: string;
  sentAt: string;
};

export type Analytics = {
  flush(callback: (err: Error | null) => void): Promise<FlushResponse>;
};

export const flushAnalytics = async (
  analytics: Analytics,
): Promise<FlushResponse | Error> => {
  try {
    const flushResponse = await analytics.flush((err) => {
      if (err) {
        throw err;
      }
    });
    return flushResponse;
  } catch (error) {
    return error as Error | FlushResponse;
  }
};

type Server = HttpServer;

export const closeServer = (server: Server): Promise<void> => {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

let isShuttingDown = false;

export const setIsShuttingDown = (value: boolean) => {
  isShuttingDown = value;
};

export const getIsShuttingDown = () => isShuttingDown;

export const cleanupAndExit = async (
  server: Server,
  analytics: Analytics,
): Promise<void> => {
  if (isShuttingDown) {
    logger.info(`cleanupAndExit already in progress`);
    return;
  }
  isShuttingDown = true;

  try {
    const flushAnalyticsResult = await flushAnalytics(analytics);
    logger.info(`flushAnalyticsResult: ${flushAnalyticsResult}`);

    // CloseServer will block until all clients have disconnected.
    const serverCloseResult = await closeServer(server);
    logger.info(`serverCloseResult: ${serverCloseResult}`);

    if ((serverCloseResult as any) instanceof Error) {
      throw new Error(`Error during server shutdown: ${serverCloseResult}`);
    }

    if (flushAnalyticsResult instanceof Error) {
      throw new Error(`Error on exitGracefully: ${flushAnalyticsResult}`);
    }
  } catch (error) {
    logger.error(`cleanupAndExit error: ${error}`);
  } finally {
    logger.info(`cleanupAndExit done`);
    process.exit(0);
  }
};
