import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { handleChannelCreated } from './handleChannelCreated';

describe('handleChannelCreated', () => {
  let instance: SocketService;

  const channelId = 'sampleChannelId';

  const spyLogger = jest.spyOn(logger, 'SocketService');
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

  it('should log debug information', () => {
    const handler = handleChannelCreated(instance, channelId);
    handler('someId');

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handleChannelCreated()] context=someContext on 'channel_created-sampleChannelId'",
      'someId',
    );
  });

  it('should emit CHANNEL_CREATED event with the passed ID when the handler is called', () => {
    const handler = handleChannelCreated(instance, channelId);
    handler('someId');

    expect(mockEmit).toHaveBeenCalledWith(EventType.CHANNEL_CREATED, 'someId');
  });
});
