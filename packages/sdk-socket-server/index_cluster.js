/* eslint-disable node/no-process-env */
require('dotenv').config();

const http = require('http');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const { setupWorker } = require('@socket.io/sticky');
const redisAdapter = require('socket.io-redis');

const configureSocketIO = require('./socket-config');
const { app, analytics } = require('./api-config');
const { cleanupAndExit } = require('./utils');

console.log('INFO> numCPUs:', numCPUs);
console.log(`INFO> Environment: ${process.env.NODE_ENV || 'PRODUCTION'}`);

const port = process.env.port || 4000;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
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
  server.listen(port, () => {
    console.log(`INFO> Worker listening on *:${port}`);
  });

  // Configuring the Socket.IO server and attaching the redis adapter.
  const io = configureSocketIO(server);

  const redisHost = process.env.REDIS_SERVER_HOST || 'redis';
  const redisPort = process.env.REDIS_SERVER_PORT || 6379;
  io.adapter(redisAdapter({ host: redisHost, port: redisPort }));
  setupWorker(io);

  // Register event listeners for process termination events for cleanup in each worker.
  process.on('SIGINT', () => cleanupAndExit(server, analytics));
  process.on('SIGTERM', () => cleanupAndExit(server, analytics));
}
