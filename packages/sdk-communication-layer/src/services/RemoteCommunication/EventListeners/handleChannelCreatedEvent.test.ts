import { RemoteCommunication } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import * as loggerModule from '../../../utils/logger';
import { handleChannelCreatedEvent } from './handleChannelCreatedEvent';

describe('handleChannelCreatedEvent', () => {
  let instance: RemoteCommunication;

  const spyLogger = jest.spyOn(loggerModule, 'loggerRemoteLayer');
  const mockEmit = jest.fn();

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

    expect(spyLogger).toHaveBeenCalledWith(
      "[RemoteCommunication: handleChannelCreatedEvent()] context=testContext on 'channel_created' channelId=sampleChannelId",
    );
  });

  it('should emit CHANNEL_CREATED event with the channel ID', () => {
    const channelId = 'sampleChannelId';
    const handler = handleChannelCreatedEvent(instance);
    handler(channelId);
    expect(mockEmit).toHaveBeenCalledWith(EventType.CHANNEL_CREATED, channelId);
  });
});
