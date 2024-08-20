import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { reconnectSocket } from '../ConnectionManager/reconnectSocket';
import { handleDisconnect } from './handleDisconnect';

jest.mock('../../../utils/logger');
jest.mock('../ConnectionManager/reconnectSocket');

describe('handleDisconnect', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const mockEmit = jest.fn();
  const mockReconnectSocket = reconnectSocket as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        manualDisconnect: false,
      },
      emit: mockEmit,
    } as unknown as SocketService;

    mockReconnectSocket.mockResolvedValue(undefined);
  });

  it('should log debug information when the handler is called', () => {
    const handler = handleDisconnect(instance);
    handler('someReason');

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handleDisconnect()] on 'disconnect' manualDisconnect=false",
      'someReason',
    );
  });

  it('should emit SOCKET_DISCONNECTED event and attempt to reconnect when disconnection was not manual', async () => {
    const handler = handleDisconnect(instance);
    await handler('someReason');

    expect(mockEmit).toHaveBeenCalledWith(EventType.SOCKET_DISCONNECTED);
    expect(mockReconnectSocket).toHaveBeenCalledWith(instance);
  });

  it('should not attempt to reconnect when disconnection was manual', async () => {
    instance.state.manualDisconnect = true;

    const handler = handleDisconnect(instance);
    await handler('someReason');

    expect(mockEmit).not.toHaveBeenCalledWith(EventType.SOCKET_DISCONNECTED);
    expect(mockReconnectSocket).not.toHaveBeenCalled();
  });

  it('should handle errors when reconnection fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockReconnectSocket.mockRejectedValue(new Error('Reconnection failed'));

    const handler = handleDisconnect(instance);
    await handler('someReason');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'SocketService::handleDisconnect Error reconnecting socket',
      new Error('Reconnection failed'),
    );

    consoleErrorSpy.mockRestore();
  });
});
