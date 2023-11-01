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

const WORKER_ROLES = {
  REST: 'rest',
  SOCKET: 'socket',
} as const;

type WorkerRole = (typeof WORKER_ROLES)[keyof typeof WORKER_ROLES];

console.log('START> isDevelopment?', isDevelopment);

// Map to keep track of worker roles
const workerRoles: Record<string, WorkerRole> = {};
if (cluster.isPrimary) {
  console.log(`START> Master ${process.pid} is running`);

  // Fork a dedicated worker for Socket.io and record its role
  const socketWorker = cluster.fork({ INSTANCE: WORKER_ROLES.SOCKET });
  workerRoles[socketWorker.id] = WORKER_ROLES.SOCKET;

  // Fork workers for REST API for all CPUs except one and record their roles
  for (let i = 0; i < numCPUs - 1; i++) {
    const restWorker = cluster.fork({ INSTANCE: WORKER_ROLES.REST });
    workerRoles[restWorker.id] = WORKER_ROLES.REST;
  }

  const MAX_RESTARTS: number = 5;
  const workerRestartCounts: number[] = [];

  cluster.on('exit', (worker, code, signal) => {
    const role = workerRoles[worker.id];
    workerRestartCounts[worker.id] = (workerRestartCounts[worker.id] || 0) + 1;

    if (workerRestartCounts[worker.id] <= MAX_RESTARTS) {
      const newWorker = cluster.fork({ INSTANCE: role });
      workerRoles[newWorker.id] = role;
    } else {
      console.error(
        `Worker ${worker.id} exceeded restart limit. Not restarting.`,
      );
      delete workerRestartCounts[worker.id];
    }
    delete workerRoles[worker.id];
  });

  // Listen for messages from workers
  cluster.on('message', (worker, message) => {
    if (message.type === 'error') {
      console.error(
        `ERROR> Worker ${worker.process.pid} reported an error: ${message.message}`,
      );
      console.error(message.error);
    }
  });

  // Error handling
  cluster.on('error', (error) => {
    console.error(`ERROR> An error occurred in the cluster: ${error}`);
  });
} else {
  const port: number = Number(process.env.PORT) || 4000;
  const server = http.createServer(app);

  if (process.env.INSTANCE === WORKER_ROLES.SOCKET) {
    try {
      // Dedicated instance for Socket.io
      configureSocketIO(server);
      console.log(
        `START> SOCKET.IO server listening on *:${port}, worker ${process.pid}`,
      );
    } catch (error) {
      process.send?.({
        type: 'error',
        message: 'An error occurred in Socket.IO',
        error,
      });
    }
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
