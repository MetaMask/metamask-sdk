import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { handleClientsConnected } from './handleClientsConnected';

describe('handleClientsConnected', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const channelId = 'sampleChannelId';
  const mockEmit = jest.fn();
  const mockStart = jest.fn();
  const mockAreKeysExchanged = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'someContext',
        isOriginator: false,
        resumed: false,
        clientsPaused: false,
        keyExchange: {
          areKeysExchanged: mockAreKeysExchanged,
          start: mockStart,
        },
        clientsConnected: false,
      },
      emit: mockEmit,
    } as unknown as SocketService;
  });

  it('should log debug information', async () => {
    const handler = handleClientsConnected(instance, channelId);
    await handler('someId');

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handleClientsConnected()] context=someContext on 'clients_connected-sampleChannelId'  resumed=false  clientsPaused=false keysExchanged=undefined isOriginator=false",
    );

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handleClientsConnected()] context=someContext on 'clients_connected' / keysExchanged=undefined -- backward compatibility",
    );
  });

  it('should emit CLIENTS_CONNECTED event with the proper data when the handler is called', async () => {
    const handler = handleClientsConnected(instance, channelId);
    await handler('someId');

    expect(mockEmit).toHaveBeenCalledWith(EventType.CLIENTS_CONNECTED, {
      isOriginator: instance.state.isOriginator,
      keysExchanged: instance.state.keyExchange?.areKeysExchanged(),
      context: instance.state.context,
    });
  });

  it('should initiate key exchange when resumed is true and instance is not an originator', async () => {
    instance.state.resumed = true;

    const handler = handleClientsConnected(instance, channelId);
    await handler('someId');

    expect(mockStart).toHaveBeenCalledWith({
      isOriginator: instance.state.isOriginator,
    });
  });

  it('should not initiate key exchange when clientsPaused is true', async () => {
    instance.state.clientsPaused = true;

    const handler = handleClientsConnected(instance, channelId);
    await handler('someId');

    expect(mockStart).not.toHaveBeenCalled();
  });

  it('should handle the reconnect scenario when not an originator', async () => {
    instance.state.isOriginator = false;
    mockAreKeysExchanged.mockReturnValueOnce(false);

    const handler = handleClientsConnected(instance, channelId);
    await handler('someId');

    expect(mockStart).toHaveBeenCalledWith({
      isOriginator: instance.state.isOriginator,
      force: true,
    });
  });

  it('should update state.clientsConnected and state.clientsPaused', async () => {
    const handler = handleClientsConnected(instance, channelId);
    await handler('someId');

    expect(instance.state.clientsConnected).toBe(true);
    expect(instance.state.clientsPaused).toBe(false);
  });
});
