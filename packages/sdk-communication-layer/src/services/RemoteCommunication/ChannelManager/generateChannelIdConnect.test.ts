/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { SocketService } from '../../../SocketService';
import { CommunicationLayer } from '../../../types/CommunicationLayer';
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
      } as unknown as CommunicationLayer,
      ready: false,
      channelId: undefined,
      sessionDuration: 1000,
      debug: false,
    } as RemoteCommunicationState;
  });

  it('should throw error if communicationLayer is not initialized', () => {
    state.communicationLayer = undefined;

    expect(() => {
      generateChannelIdConnect(state);
    }).toThrow('communication layer not initialized');
  });

  it('should throw error if channel is already connected', () => {
    state.ready = true;
    state.communicationLayer = {
      isConnected: jest.fn(() => true),
    } as unknown as SocketService;

    expect(() => {
      generateChannelIdConnect(state);
    }).toThrow('Channel already connected');
  });

  it('should generate a new channel ID if none exists', () => {
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

    const result = generateChannelIdConnect(state);
    expect(result).toStrictEqual({
      channelId: 'mockChannelId',
      pubKey: 'mockPublicKey',
      privKey: undefined,
    });
  });

  it('should persist channelConfig if storageManager exists', () => {
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

    generateChannelIdConnect(state);

    expect(mockPersist).toHaveBeenCalledWith({
      channelId: 'mockChannelId',
      validUntil: expect.any(Number),
    });
  });

  it('should log debug messages', () => {
    generateChannelIdConnect(state);

    expect(spyLogger).toHaveBeenCalled();
  });
});
