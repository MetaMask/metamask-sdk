import { v4 as uuid } from 'uuid';
import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { SocketService } from '../../../SocketService';
import { StorageManager } from '../../../types/StorageManager';
import { logger } from '../../../utils/logger';
import { connectToChannel } from './connectToChannel';

describe('connectToChannel', () => {
  let state: RemoteCommunicationState;

  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      communicationLayer: {
        isConnected: jest.fn(() => false),
        connectToChannel: jest.fn(),
      } as unknown as SocketService,
      channelId: undefined,
      sessionDuration: 1000,
      context: 'TestContext',
      debug: false,
    } as RemoteCommunicationState;
  });

  it('should throw error if channel ID is invalid', async () => {
    const channelId = 'invalidChannelId';

    await expect(connectToChannel({ channelId, state })).rejects.toThrow(
      `Invalid channel ${channelId}`,
    );
  });

  it('should debug log if the channel is already connected', async () => {
    const channelId = uuid();

    state.communicationLayer = {
      isConnected: jest.fn(() => true),
    } as unknown as SocketService;

    await connectToChannel({ channelId, state });

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should connect to a valid channel', async () => {
    const channelId = uuid();
    const mockConnect = jest.fn();
    state.communicationLayer = {
      isConnected: jest.fn(() => false),
      connectToChannel: mockConnect,
    } as unknown as SocketService;

    await connectToChannel({ channelId, state });

    expect(mockConnect).toHaveBeenCalledWith({
      channelId,
      withKeyExchange: undefined,
    });
  });

  it('should persist channelConfig if storageManager exists', async () => {
    const channelId = uuid();
    const mockPersist = jest.fn();

    state.communicationLayer = {
      isConnected: jest.fn(() => false),
      connectToChannel: jest.fn(),
    } as unknown as SocketService;

    state.storageManager = {
      persistChannelConfig: mockPersist,
    } as unknown as StorageManager;

    await connectToChannel({ channelId, state });

    expect(mockPersist).toHaveBeenCalledWith({
      channelId,
      validUntil: expect.any(Number),
    });
  });

  it('should connect with key exchange when provided', async () => {
    const channelId = uuid();
    const mockConnect = jest.fn();
    state.communicationLayer = {
      isConnected: jest.fn(() => false),
      connectToChannel: mockConnect,
    } as unknown as SocketService;

    await connectToChannel({ channelId, withKeyExchange: true, state });

    expect(mockConnect).toHaveBeenCalledWith({
      channelId,
      withKeyExchange: true,
    });
  });

  it('should debug log a valid channelId', async () => {
    const channelId = uuid();

    await connectToChannel({ channelId, state });

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should set the new channelId in the state', async () => {
    const channelId = uuid();

    await connectToChannel({ channelId, state });

    expect(state.channelId).toStrictEqual(channelId);
  });
});
