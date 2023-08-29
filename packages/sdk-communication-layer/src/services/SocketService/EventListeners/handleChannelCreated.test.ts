import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { handleChannelCreated } from './handleChannelCreated';

describe('handleChannelCreated', () => {
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

  it('should return a function', () => {
    const handler = handleChannelCreated(instance, channelId);
    expect(typeof handler).toBe('function');
  });

  it('should log debug information when debugging is enabled and the handler is called', () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;

    const handler = handleChannelCreated(instance, channelId);
    handler('someId');

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      `SocketService::${instance.state.context}::setupChannelListener::on 'channel_created-${channelId}'`,
      'someId',
    );

    consoleDebugSpy.mockRestore();
  });

  it('should emit CHANNEL_CREATED event with the passed ID when the handler is called', () => {
    const handler = handleChannelCreated(instance, channelId);
    handler('someId');

    expect(mockEmit).toHaveBeenCalledWith(EventType.CHANNEL_CREATED, 'someId');
  });
});
