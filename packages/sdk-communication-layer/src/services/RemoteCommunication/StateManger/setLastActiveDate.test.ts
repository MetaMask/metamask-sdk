import { RemoteCommunication } from '../../../RemoteCommunication';
import { ChannelConfig } from '../../../types/ChannelConfig';
import { setLastActiveDate } from './setLastActiveDate';

describe('setLastActiveDate', () => {
  let instance: RemoteCommunication;
  let lastActiveDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        channelId: 'test-channel-id',
        channelConfig: {
          validUntil: 1629820440000,
        },
        storageManager: {
          persistChannelConfig: jest.fn(),
        },
      },
    } as unknown as RemoteCommunication;

    lastActiveDate = new Date('2023-01-01T12:00:00Z');
  });

  it('should log if debug mode is enabled', () => {
    instance.state.debug = true;
    const consoleDebugSpy = jest.spyOn(console, 'debug');

    setLastActiveDate(instance, lastActiveDate);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      `RemoteCommunication::setLastActiveDate() channel=${instance.state.channelId}`,
      lastActiveDate,
    );

    consoleDebugSpy.mockRestore();
  });

  it('should set the lastActive attribute correctly', () => {
    setLastActiveDate(instance, lastActiveDate);

    const expectedChannelConfig: ChannelConfig = {
      channelId: 'test-channel-id',
      validUntil: 1629820440000,
      lastActive: lastActiveDate.getTime(),
    };

    expect(
      instance.state.storageManager?.persistChannelConfig,
    ).toHaveBeenCalledWith(expectedChannelConfig);
  });

  it('should handle case when channelId or validUntil are undefined', () => {
    instance.state.channelId = undefined;
    instance.state.channelConfig = undefined;

    setLastActiveDate(instance, lastActiveDate);

    const expectedChannelConfig: ChannelConfig = {
      channelId: '',
      validUntil: 0,
      lastActive: lastActiveDate.getTime(),
    };

    expect(
      instance.state.storageManager?.persistChannelConfig,
    ).toHaveBeenCalledWith(expectedChannelConfig);
  });
});
