import { Server as HTTPServer } from 'http';
import { Server as IoServer } from 'socket.io';
import { io as clientIo, Socket } from 'socket.io-client';
import createIoServer from './socket-config';

describe('Socket Config', () => {
  let httpServer: HTTPServer;
  let ioServer: IoServer;
  let clientSocket: Socket;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    httpServer = new HTTPServer();

    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        const { port } = httpServer.address() as { port: number };
        ioServer = createIoServer(httpServer);
        clientSocket = clientIo(`http://localhost:${port}`);
        resolve();
      });
    });
  });

  afterEach(() => {
    ioServer.close();
    clientSocket.close();
    httpServer.close();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should log "INFO> connection" on connection', (done) => {
    clientSocket.on('connect', () => {
      expect(logSpy).toHaveBeenCalledWith('INFO> connection');
      done();
    });
    clientSocket.connect();
  });

  it('should log "INFO> create_channel" on create_channel', (done) => {
    clientSocket.emit('create_channel', 'some-id');
    setTimeout(() => {
      expect(logSpy).toHaveBeenCalledWith('INFO> create_channel');
      done();
    }, 100);
  });

  it('should log "INFO> ping" on ping', (done) => {
    clientSocket.emit('ping', {
      id: 'some-id',
      message: 'some-message',
      context: '',
    });

    setTimeout(() => {
      expect(logSpy).toHaveBeenCalledWith('INFO> ping');
      done();
    }, 100);
  });
});
