import { Server as HttpServer } from 'http';

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
    return;
  }
  isShuttingDown = true;

  const serverCloseResult = await closeServer(server);
  const flushAnalyticsResult = await flushAnalytics(analytics);

  if ((serverCloseResult as any) instanceof Error) {
    throw new Error(`Error during server shutdown: ${serverCloseResult}`);
  }

  if (flushAnalyticsResult instanceof Error) {
    throw new Error(`Error on exitGracefully: ${flushAnalyticsResult}`);
  }
};
