import { collectDefaultMetrics, Gauge, Registry } from 'prom-client';

const register = new Registry();

collectDefaultMetrics({ register });

export async function readMetrics() {
  return await register.metrics();
}

const socketIoServerTotalClients = new Gauge({
  name: 'socket_io_server_total_clients',
  help: 'Total number of connected clients',
  labelNames: [],
  registers: [register],
});

const socketIoServerTotalRooms = new Gauge({
  name: 'socket_io_server_total_rooms',
  help: 'Total number of rooms',
  labelNames: [],
  registers: [register],
});

export function setSocketIoServerTotalClients(count: number) {
  socketIoServerTotalClients.set(count);
}

export function setSocketIoServerTotalRooms(count: number) {
  socketIoServerTotalRooms.set(count);
}
