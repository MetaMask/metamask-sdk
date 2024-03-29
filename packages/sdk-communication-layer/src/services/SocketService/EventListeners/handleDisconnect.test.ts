import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import * as ConnectionManager from '../ConnectionManager';
import { logger } from '../../../utils/logger';
import { handleDisconnect } from './handleDisconnect';

jest.mock('../ConnectionManager');

describe('handleDisconnect', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const mockEmit = jest.fn();
  const checkFocusAndReconnect =
    ConnectionManager.checkFocusAndReconnect as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        manualDisconnect: false,
      },
      emit: mockEmit,
    } as unknown as SocketService;
  });

  it('should log debug information when debugging is enabled and the handler is called', () => {
    const handler = handleDisconnect(instance);
    handler('someReason');

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handleDisconnect()] on 'disconnect' manualDisconnect=false",
      'someReason',
    );
  });

  it('should emit SOCKET_DISCONNECTED event and attempt to reconnect when disconnection was not manual', () => {
    const handler = handleDisconnect(instance);
    handler('someReason');

    expect(mockEmit).toHaveBeenCalledWith(EventType.SOCKET_DISCONNECTED);
    expect(checkFocusAndReconnect).toHaveBeenCalledWith(instance);
  });

  it('should not attempt to reconnect when disconnection was manual', () => {
    instance.state.manualDisconnect = true;

    const handler = handleDisconnect(instance);
    handler('someReason');

    expect(mockEmit).not.toHaveBeenCalledWith(EventType.SOCKET_DISCONNECTED);
    expect(checkFocusAndReconnect).not.toHaveBeenCalled();
  });
});
