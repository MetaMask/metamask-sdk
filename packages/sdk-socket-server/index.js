/* eslint-disable node/no-process-env */
require('dotenv').config();
const http = require('http');

const { app, analytics } = require('./api-config');
const configureSocketIO = require('./socket-config');
const { cleanupAndExit, isDevelopment } = require('./utils');

const server = http.createServer(app);
configureSocketIO(server); // configure socket.io server

console.log('INFO> isDevelopment?', isDevelopment);

// Register event listeners for process termination events
process.on('SIGINT', () => cleanupAndExit(server, analytics));
process.on('SIGTERM', () => cleanupAndExit(server, analytics));

const port = process.env.port || 4000;
server.listen(port, () => {
  console.log(`INFO> listening on *:${port}`);
});
