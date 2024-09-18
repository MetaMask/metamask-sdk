/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { SocketService } from '../../../SocketService';
import { StorageManager } from '../../../types/StorageManager';
import { logger } from '../../../utils/logger';
import { generateChannelIdConnect } from './generateChannelIdConnect';

jest.mock('./clean');

describe('generateChannelIdConnect', () => {
  let state: RemoteCommunicationState;

  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      channelConfig: undefined,
      communicationLayer: {
        channelId: 'mockChannelId',
        pubKey: 'mockPublicKey',
        createChannel: jest.fn(() => ({
          channelId: 'mockChannelId',
          pubKey: 'mockPublicKey',
        })),
        isConnected: jest.fn(() => false),
        getKeyInfo: jest.fn(() => ({ ecies: { public: 'mockPublicKey' } })),
      } as unknown as SocketService,
      ready: false,
      channelId: undefined,
      sessionDuration: 1000,
      debug: false,
    } as RemoteCommunicationState;
  });

  it('should throw error if channel is already connected', async () => {
    state.ready = true;

    await expect(generateChannelIdConnect(state)).rejects.toThrow(
      'Channel already connected',
    );
  });

  it('should generate a new channel ID if none exists', async () => {
    const mockChannel = {
      channelId: 'mockChannelId',
      pubKey: 'mockPublicKey',
      createChannel: jest.fn(() => ({
        channelId: 'mockChannelId',
        pubKey: 'mockPublicKey',
      })),
      isConnected: jest.fn(() => false),
      getKeyInfo: jest.fn(() => ({ ecies: { public: 'mockPublicKey' } })),
    } as unknown as SocketService;

    state.communicationLayer = mockChannel;

    const result = await generateChannelIdConnect(state);
    expect(result).toStrictEqual({
      channelId: 'mockChannelId',
      pubKey: 'mockPublicKey',
      privKey: undefined,
    });
  });

  it('should persist channelConfig if storageManager exists', async () => {
    const mockChannel = {
      channelId: 'mockChannelId',
      pubKey: 'mockPublicKey',
      createChannel: jest.fn(() => ({
        channelId: 'mockChannelId',
        pubKey: 'mockPublicKey',
      })),
      isConnected: jest.fn(() => true),
      getKeyInfo: jest.fn(() => ({ ecies: { public: 'mockPublicKey' } })),
    } as unknown as SocketService;

    const mockPersist = jest.fn();

    state.communicationLayer = mockChannel;
    state.channelId = 'mockChannelId';
    state.storageManager = {
      persistChannelConfig: mockPersist,
    } as unknown as StorageManager;

    await generateChannelIdConnect(state);

    expect(mockPersist).toHaveBeenCalledWith({
      channelId: 'mockChannelId',
      validUntil: expect.any(Number),
    });
  });

  it('should log debug messages', async () => {
    await generateChannelIdConnect(state);

    expect(spyLogger).toHaveBeenCalled();
  });
});
