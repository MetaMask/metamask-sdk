import dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';
import http from 'http';
import { app, analytics } from './api-config';
import configureSocketIO from './socket-config';
import { cleanupAndExit } from './utils';

dotenv.config();

const isDevelopment: boolean = process.env.NODE_ENV === 'development';
const numCPUs = os.cpus().length;

console.log('START> isDevelopment?', isDevelopment);

// Map to keep track of worker roles
const workerRoles: Record<string, string> = {};

if (cluster.isPrimary) {
  console.log(`START> Master ${process.pid} is running`);

  // Fork a dedicated worker for Socket.io and record its role
  const socketWorker = cluster.fork({ INSTANCE: 'socket' });
  workerRoles[socketWorker.id] = 'socket';

  // Fork workers for REST API for all CPUs except one and record their roles
  for (let i = 0; i < numCPUs - 1; i++) {
    const restWorker = cluster.fork({ INSTANCE: 'rest' });
    workerRoles[restWorker.id] = 'rest';
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    if (workerRoles[worker.id] === 'rest') {
      const newWorker = cluster.fork({ INSTANCE: 'rest' });
      workerRoles[newWorker.id] = 'rest';
    }
    delete workerRoles[worker.id];
  });
} else {
  const port: number = Number(process.env.PORT) || 4000;
  const server = http.createServer(app);

  if (process.env.INSTANCE === 'socket') {
    // Dedicated instance for Socket.io
    configureSocketIO(server);
    console.log(
      `START> SOCKET.IO server listening on *:${port}, worker ${process.pid}`,
    );
  } else {
    // REST API servers
    console.log(
      `START> REST API listening on *:${port}, worker ${process.pid}`,
    );
  }

  server.listen(port, () => {
    console.log('START> Server started');
  });

  // Register event listeners for process termination events
  process.on('SIGINT', async () => {
    await cleanupAndExit(server, analytics);
  });
  process.on('SIGTERM', async () => {
    await cleanupAndExit(server, analytics);
  });
}
