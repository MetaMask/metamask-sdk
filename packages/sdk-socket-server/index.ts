import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { app, analytics } from './api-config';
import configureSocketIO from './socket-config';
import { cleanupAndExit } from './utils';

export const isDevelopment: boolean = process.env.NODE_ENV === 'development';
export const isDevelopmentServer: boolean =
  process.env.ENVIRONMENT === 'development';

const server = http.createServer(app);
configureSocketIO(server); // configure socket.io server

console.log('INFO> isDevelopment?', isDevelopment);

// Register event listeners for process termination events
process.on('SIGINT', async () => {
  await cleanupAndExit(server, analytics);
});
process.on('SIGTERM', async () => {
  await cleanupAndExit(server, analytics);
});

const port: number = Number(process.env.PORT) || 4000;
server.listen(port, () => {
  console.log(`INFO> listening on *:${port}`);
});
