import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import * as loggerModule from '../../../utils/logger';
import { handleClientsWaitingToJoin } from './handleClientsWaitingToJoin';

describe('handleClientsWaitingToJoin', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(loggerModule, 'loggerServiceLayer');
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
    const handler = handleClientsWaitingToJoin(instance, channelId);
    handler(5);

    expect(spyLogger).toHaveBeenCalledWith(
      `[SocketService: handleClientsWaitingToJoin()] context=${instance.state.context} on 'clients_waiting_to_join-${channelId}'`,
      5,
    );
  });

  it('should emit CLIENTS_WAITING event with the number of waiting users', () => {
    const handler = handleClientsWaitingToJoin(instance, channelId);
    handler(5);

    expect(mockEmit).toHaveBeenCalledWith(EventType.CLIENTS_WAITING, 5);
  });
});
