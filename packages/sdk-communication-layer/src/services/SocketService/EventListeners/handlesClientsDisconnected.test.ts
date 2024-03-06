import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { handlesClientsDisconnected } from './handlesClientsDisconnected';

describe('handlesClientsDisconnected', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');

  const mockEmit = jest.fn();
  const channelId = 'testChannel';
  const mockClean = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        clientsConnected: true,
        debug: false,
        context: 'testContext',
        isOriginator: false,
        clientsPaused: false,
        keyExchange: {
          clean: mockClean,
        },
      },
      emit: mockEmit,
    } as unknown as SocketService;
  });

  it('should update the clientsConnected state to false when handler is called', () => {
    const handler = handlesClientsDisconnected(instance, channelId);
    handler();

    expect(instance.state.clientsConnected).toBe(false);
  });

  it('should log a debug info', () => {
    const handler = handlesClientsDisconnected(instance, channelId);
    handler();

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handlesClientsDisconnected()] context=testContext on 'clients_disconnected-testChannel'",
    );
  });

  it('should clean key exchange if the instance is the originator and clients are not paused', () => {
    instance.state.isOriginator = true;

    const handler = handlesClientsDisconnected(instance, channelId);
    handler();

    expect(mockClean).toHaveBeenCalled();
  });

  it('should not clean key exchange if clients are paused', () => {
    instance.state.isOriginator = true;
    instance.state.clientsPaused = true;

    const handler = handlesClientsDisconnected(instance, channelId);
    handler();

    expect(mockClean).not.toHaveBeenCalled();
  });

  it('should emit the CLIENTS_DISCONNECTED event', () => {
    const handler = handlesClientsDisconnected(instance, channelId);
    handler();

    expect(mockEmit).toHaveBeenCalledWith(
      EventType.CLIENTS_DISCONNECTED,
      channelId,
    );
  });
});
