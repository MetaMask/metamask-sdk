import { handleClientsWaitingToJoin } from '../handleClientsWaitingToJoin';
import { SocketService } from '../../../../SocketService';
import { EventType } from '../../../../types/EventType';

describe('handleClientsWaitingToJoin', () => {
  let instance: SocketService;
  const channelId = 'sampleChannelId';
  const mockEmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'someContext',
      },
      emit: mockEmit,
    } as unknown as SocketService;
  });

  it('should log debug information when debugging is enabled and the handler is called', () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;

    const handler = handleClientsWaitingToJoin(instance, channelId);
    handler(5);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `SocketService::${instance.state.context}::setupChannelListener::on 'clients_waiting_to_join-${channelId}'`,
      ),
      5,
    );

    consoleDebugSpy.mockRestore();
  });

  it('should emit CLIENTS_WAITING event with the number of waiting users', () => {
    const handler = handleClientsWaitingToJoin(instance, channelId);
    handler(5);

    expect(mockEmit).toHaveBeenCalledWith(EventType.CLIENTS_WAITING, 5);
  });
});
