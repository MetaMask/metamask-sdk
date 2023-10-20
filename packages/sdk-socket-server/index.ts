import http from 'http';
import dotenv from 'dotenv';
import { app, analytics } from './api-config';
import configureSocketIO from './socket-config';
import { cleanupAndExit } from './utils';

dotenv.config();
const isDevelopment: boolean = process.env.NODE_ENV === 'development';

const server = http.createServer(app);
configureSocketIO(server); // configure socket.io server

console.log('INFO> isDevelopment?', isDevelopment);

// Register event listeners for process termination events
process.on('SIGINT', () => cleanupAndExit(server, analytics));
process.on('SIGTERM', () => cleanupAndExit(server, analytics));

const port: number = Number(process.env.port) || 4000;
server.listen(port, () => {
  console.log(`INFO> listening on *:${port}`);
});
