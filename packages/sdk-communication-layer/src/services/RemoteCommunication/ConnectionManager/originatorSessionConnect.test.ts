import { RemoteCommunication } from '../../../RemoteCommunication';
import { logger } from '../../../utils/logger';
import { originatorSessionConnect } from './originatorSessionConnect';

describe('originatorSessionConnect', () => {
  let instance: RemoteCommunication;

  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');
  const mockIsConnected = jest.fn();
  const mockGetPersistedChannelConfig = jest.fn();
  const mockConnectToChannel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: true,
        storageManager: {
          getPersistedChannelConfig: mockGetPersistedChannelConfig,
        },
        communicationLayer: {
          isConnected: mockIsConnected,
          connectToChannel: mockConnectToChannel,
        },
      },
    } as unknown as RemoteCommunication;

    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  it('should skip if no storage manager is defined', async () => {
    delete instance.state.storageManager;
    const result = await originatorSessionConnect(instance);
    expect(result).toBeUndefined();
    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: originatorSessionConnect()] no storage manager defined - skip',
    );
  });

  it('should skip if the socket is already connected', async () => {
    mockIsConnected.mockReturnValueOnce(true);
    const result = await originatorSessionConnect(instance);
    expect(result).toBeUndefined();
    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: originatorSessionConnect()] socket already connected - skip',
    );
  });

  it('should skip if the stored channel config is expired', async () => {
    const mockConfig = {
      validUntil: Date.now() - 100000, // past date to ensure the session is expired
      channelId: 'mockChannelId',
    };
    mockGetPersistedChannelConfig.mockResolvedValueOnce(mockConfig);

    const result = await originatorSessionConnect(instance);
    expect(result).toBeUndefined();
    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: autoConnect()] Session has expired',
    );
  });

  it('should handle null channel configuration', async () => {
    mockGetPersistedChannelConfig.mockResolvedValueOnce(null);

    const result = await originatorSessionConnect(instance);
    expect(result).toBeUndefined();
  });

  it('should set originatorConnectStarted to false when no channel config is found', async () => {
    mockGetPersistedChannelConfig.mockResolvedValueOnce(undefined);

    await originatorSessionConnect(instance);
    expect(instance.state.originatorConnectStarted).toBe(false);
  });

  it('should set originatorConnectStarted to false when session is expired', async () => {
    const mockConfig = {
      validUntil: Date.now() - 100000,
      channelId: 'mockChannelId',
    };
    mockGetPersistedChannelConfig.mockResolvedValueOnce(mockConfig);

    await originatorSessionConnect(instance);
    expect(instance.state.originatorConnectStarted).toBe(false);
  });
});
