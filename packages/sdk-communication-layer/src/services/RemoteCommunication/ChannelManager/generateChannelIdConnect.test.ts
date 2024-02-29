/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { CommunicationLayer } from '../../../types/CommunicationLayer';
import { StorageManager } from '../../../types/StorageManager';
import * as loggerModule from '../../../utils/logger';
import { generateChannelIdConnect } from './generateChannelIdConnect';
import { clean } from './clean';

jest.mock('./clean');

describe('generateChannelIdConnect', () => {
  let state: RemoteCommunicationState;

  const spyLogger = jest.spyOn(loggerModule, 'loggerRemoteLayer');

  const mockClean = clean as jest.MockedFunction<typeof clean>;

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
    } as unknown as CommunicationLayer;

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
    } as unknown as CommunicationLayer;

    state.communicationLayer = mockChannel;

    const result = generateChannelIdConnect(state);
    expect(result).toStrictEqual({
      channelId: 'mockChannelId',
      pubKey: 'mockPublicKey',
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
      isConnected: jest.fn(() => false),
      getKeyInfo: jest.fn(() => ({ ecies: { public: 'mockPublicKey' } })),
    } as unknown as CommunicationLayer;

    const mockPersist = jest.fn();

    state.communicationLayer = mockChannel;
    state.storageManager = {
      persistChannelConfig: mockPersist,
    } as unknown as StorageManager;

    generateChannelIdConnect(state);

    expect(mockPersist).toHaveBeenCalledWith({
      channelId: 'mockChannelId',
      validUntil: expect.any(Number),
    });
  });

  it('should log a warning if a channel already exists', () => {
    jest.spyOn(console, 'warn').mockImplementation();

    state.channelId = 'existingChannelId';
    state.communicationLayer!.isConnected = () => true;

    const { channelConfig } = state;

    generateChannelIdConnect(state);

    expect(console.warn).toHaveBeenCalledWith(
      `Channel already exists -- interrupt generateChannelId`,
      channelConfig,
    );
  });

  it('should log debug messages', () => {
    generateChannelIdConnect(state);

    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: generateChannelId()]',
    );

    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: generateChannelId()] channel created',
      { channelId: 'mockChannelId', pubKey: 'mockPublicKey' },
    );
  });

  it('should call clean function if no channelId exists', () => {
    generateChannelIdConnect(state);

    expect(mockClean).toHaveBeenCalledWith(state);
  });
});
