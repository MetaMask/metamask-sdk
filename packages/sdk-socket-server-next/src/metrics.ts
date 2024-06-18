import { Server } from 'socket.io';

export const extractMetrics = ({ ioServer }: { ioServer: Server }) => {
  const totalClients = ioServer.engine.clientsCount;
  let fullMetrics = `# HELP socket_io_server_total_clients Total number of connected clients\n`;
  fullMetrics += `# TYPE socket_io_server_total_clients gauge\n`;
  fullMetrics += `socket_io_server_total_clients ${totalClients}\n`;

  const totalRooms = ioServer.sockets.adapter.rooms.size;
  fullMetrics += `# HELP socket_io_server_total_rooms Total number of rooms\n`;
  fullMetrics += `# TYPE socket_io_server_total_rooms gauge\n`;
  fullMetrics += `socket_io_server_total_rooms ${totalRooms}\n`;

  return fullMetrics;
};
