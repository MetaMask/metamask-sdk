import { RemoteCommunication } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import { handleChannelCreatedEvent } from './handleChannelCreatedEvent';

describe('handleChannelCreatedEvent', () => {
  let instance: RemoteCommunication;
  const mockEmit = jest.fn();

  jest.spyOn(console, 'debug').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: true,
        context: 'testContext',
      },
      emit: mockEmit,
    } as unknown as RemoteCommunication;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log the channel creation event details if debugging is enabled', () => {
    const channelId = 'sampleChannelId';
    const handler = handleChannelCreatedEvent(instance);
    handler(channelId);
    expect(console.debug).toHaveBeenCalledWith(
      `RemoteCommunication::testContext::on 'channel_created' channelId=${channelId}`,
    );
  });

  it('should not log the event details if debugging is disabled', () => {
    instance.state.debug = false;
    const channelId = 'sampleChannelId';
    const handler = handleChannelCreatedEvent(instance);
    handler(channelId);
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should emit CHANNEL_CREATED event with the channel ID', () => {
    const channelId = 'sampleChannelId';
    const handler = handleChannelCreatedEvent(instance);
    handler(channelId);
    expect(mockEmit).toHaveBeenCalledWith(EventType.CHANNEL_CREATED, channelId);
  });
});
