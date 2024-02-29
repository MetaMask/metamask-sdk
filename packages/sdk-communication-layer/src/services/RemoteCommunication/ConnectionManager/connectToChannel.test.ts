import { v4 as uuid } from 'uuid';
import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { CommunicationLayer } from '../../../types/CommunicationLayer';
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
      } as unknown as CommunicationLayer,
      channelId: undefined,
      sessionDuration: 1000,
      context: 'TestContext',
      debug: false,
    } as RemoteCommunicationState;
  });

  it('should throw error if channel ID is invalid', () => {
    const channelId = 'invalidChannelId';

    expect(() => {
      connectToChannel({ channelId, state });
    }).toThrow(`Invalid channel ${channelId}`);
  });

  it('should debug log if the channel is already connected', () => {
    const channelId = uuid();

    state.communicationLayer = {
      isConnected: jest.fn(() => true),
    } as unknown as CommunicationLayer;

    connectToChannel({ channelId, state });

    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: connectToChannel()] context=TestContext already connected - interrupt connection.',
    );
  });

  it('should connect to a valid channel', () => {
    const channelId = uuid();
    const mockConnect = jest.fn();
    state.communicationLayer = {
      isConnected: jest.fn(() => false),
      connectToChannel: mockConnect,
    } as unknown as CommunicationLayer;

    connectToChannel({ channelId, state });

    expect(mockConnect).toHaveBeenCalledWith({
      channelId,
      withKeyExchange: undefined,
    });
  });

  it('should persist channelConfig if storageManager exists', () => {
    const channelId = uuid();
    const mockPersist = jest.fn();

    state.communicationLayer = {
      isConnected: jest.fn(() => false),
      connectToChannel: jest.fn(),
    } as unknown as CommunicationLayer;

    state.storageManager = {
      persistChannelConfig: mockPersist,
    } as unknown as StorageManager;

    connectToChannel({ channelId, state });

    expect(mockPersist).toHaveBeenCalledWith({
      channelId,
      validUntil: expect.any(Number),
    });
  });

  it('should connect with key exchange when provided', () => {
    const channelId = uuid();
    const mockConnect = jest.fn();
    state.communicationLayer = {
      isConnected: jest.fn(() => false),
      connectToChannel: mockConnect,
    } as unknown as CommunicationLayer;

    connectToChannel({ channelId, withKeyExchange: true, state });

    expect(mockConnect).toHaveBeenCalledWith({
      channelId,
      withKeyExchange: true,
    });
  });

  it('should debug log a valid channelId', () => {
    const channelId = uuid();

    connectToChannel({ channelId, state });

    expect(spyLogger).toHaveBeenCalledWith(
      `[RemoteCommunication: connectToChannel()] context=TestContext channelId=${channelId}`,
    );
  });

  it('should set the new channelId in the state', () => {
    const channelId = uuid();

    connectToChannel({ channelId, state });

    expect(state.channelId).toStrictEqual(channelId);
  });
});
