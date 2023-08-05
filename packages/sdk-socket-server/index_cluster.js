/* eslint-disable node/no-process-env */
require('dotenv').config();
const http = require('http');
const { app, analytics } = require('./api-config');
const configureSocketIO = require('./socket-config');
const { cleanupAndExit } = require('./utils');
const cluster = require('cluster');

const numCPUs = require('os').cpus().length;
console.log('INFO> numCPUs', numCPUs);

const { setupMaster, setupWorker } = require('@socket.io/sticky');
const redisAdapter = require('socket.io-redis');

const isDevelopment = process.env.NODE_ENV === 'development';

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Creating a server instance here but it won't be used to listen.
  // It is only for the sticky session setup.
  const httpServer = http.createServer(app);
  setupMaster(httpServer, {
    loadBalancingMethod: 'least-connection',
  });

  const port = process.env.port || 4000;
  httpServer.listen(port, () => {
    console.log(`INFO> Master listening on *:${port}`);
  });

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const server = http.createServer(app);

  // Configuring the Socket.IO server and attaching the redis adapter.
  const io = configureSocketIO(server);
  io.adapter(redisAdapter({ host: 'redis', port: 6379 }));
  setupWorker(io);

  // Register event listeners for process termination events for cleanup in each worker.
  process.on('SIGINT', () => cleanupAndExit(server, analytics));
  process.on('SIGTERM', () => cleanupAndExit(server, analytics));

  console.log('INFO> isDevelopment?', isDevelopment);
}
