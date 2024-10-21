import * as prometheus from 'prom-client';

const register = new prometheus.Registry();

prometheus.collectDefaultMetrics({ register });

export async function read() {
  return await register.metrics();
}

const socketIoServerTotalClients = new prometheus.Gauge({
  name: 'socket_io_server_total_clients',
  help: 'Total number of connected clients',
  labelNames: [],
  registers: [register],
});

const socketIoServerTotalRooms = new prometheus.Gauge({
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
