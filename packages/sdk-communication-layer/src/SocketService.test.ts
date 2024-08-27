/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Socket, io } from 'socket.io-client';
import { SocketService, SocketServiceProps } from './SocketService';
import { KeyExchange } from './KeyExchange';
import { createChannel } from './services/SocketService/ChannelManager';
import {
  connectToChannel,
  disconnect,
  pause,
  ping,
  resume,
} from './services/SocketService/ConnectionManager';
import { keyCheck, resetKeys } from './services/SocketService/KeysManager';
import { DisconnectOptions } from './types/DisconnectOptions';
import { handleSendMessage } from './services/SocketService/MessageHandlers';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { MessageType } from './types/MessageType';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';

jest.mock('socket.io-client');
jest.mock('./KeyExchange');
jest.mock('./services/SocketService/ConnectionManager');
jest.mock('./services/SocketService/ChannelManager');
jest.mock('./services/SocketService/KeysManager');
jest.mock('./services/SocketService/MessageHandlers');

describe('SocketService', () => {
  let socketService: SocketService;
  let mockSocket: Partial<Socket>;

  const socketServiceProps = {
    communicationLayerPreference: CommunicationLayerPreference.SOCKET,
    communicationServerUrl: 'http://some-url.com',
    context: {},
    remote: {
      state: {},
    },
  } as SocketServiceProps;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSocket = { connected: true };
    (io as jest.MockedFunction<typeof io>).mockReturnValue(mockSocket as any);

    socketService = new SocketService(socketServiceProps);
  });

  it('should initialize with the correct properties', () => {
    expect(socketService.state.communicationLayerPreference).toStrictEqual(
      socketServiceProps.communicationLayerPreference,
    );

    expect(socketService.state.communicationServerUrl).toStrictEqual(
      'http://some-url.com',
    );
    expect(socketService.state.context).toStrictEqual({});
    expect(socketService.state.manualDisconnect).toBe(false);
    expect(socketService.state.rpcMethodTracker).toStrictEqual({});
    expect(socketService.state.hasPlaintext).toBe(false);
    expect(socketService.state.socket).toStrictEqual(mockSocket);
    expect(socketService.state.keyExchange).toBeInstanceOf(KeyExchange);
  });

  it('should successfully connect to a channel', async () => {
    const mockOptions = { channelId: 'SOME_CHANNEL_ID' };

    await socketService.connectToChannel(mockOptions);

    expect(connectToChannel).toHaveBeenCalledWith({
      options: {
        ...mockOptions,
        withKeyExchange: false,
      },
      instance: socketService,
    });
  });

  it('should retrieve correct key information', () => {
    const mockKeyInfo = { key: 'SOME_KEY' };
    (KeyExchange.prototype.getKeyInfo as jest.Mock).mockReturnValue(
      mockKeyInfo,
    );

    const keyInfo = socketService.getKeyInfo();

    expect(keyInfo).toStrictEqual(mockKeyInfo);
  });

  it('should send a message', () => {
    const mockMessage = {
      type: MessageType.PING,
      data: {},
    } as CommunicationLayerMessage;

    socketService.sendMessage(mockMessage);

    expect(handleSendMessage).toHaveBeenCalledWith(socketService, mockMessage);
  });

  it('should send a ping to verify connection', () => {
    socketService.ping();
    expect(ping).toHaveBeenCalledWith(socketService);
  });

  it('should correctly check if service is connected', () => {
    const isConnected = socketService.isConnected();
    expect(isConnected).toBe(true);
  });

  it('should pause the connection', () => {
    socketService.pause();
    expect(pause).toHaveBeenCalledWith(socketService);
  });

  it('should resume a paused connection', () => {
    socketService.resume();
    expect(resume).toHaveBeenCalledWith(socketService);
  });

  it('should disconnect when instructed', () => {
    const mockOptions = { reason: 'SOME_REASON' } as DisconnectOptions;
    socketService.disconnect(mockOptions);
    expect(disconnect).toHaveBeenCalledWith(socketService, mockOptions);
  });

  it('should reset keys', () => {
    socketService.resetKeys();
    expect(resetKeys).toHaveBeenCalledWith(socketService);
  });

  it('should check keys', () => {
    socketService.keyCheck();
    expect(keyCheck).toHaveBeenCalledWith(socketService);
  });

  it('should create a new channel', async () => {
    const mockChannel = { id: 'CHANNEL_ID', members: [] };
    (createChannel as jest.Mock).mockReturnValue(Promise.resolve(mockChannel));

    const channel = await socketService.createChannel();

    expect(channel).toStrictEqual(mockChannel);
  });
});
