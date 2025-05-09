import packageJson from '../package.json';
import { RemoteCommunication } from './RemoteCommunication';
import { SocketService } from './SocketService';
import { clean } from './services/RemoteCommunication/ChannelManager';
import { sendMessage } from './services/RemoteCommunication/MessageHandlers';
import { testStorage } from './services/RemoteCommunication/StorageManager';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectionStatus } from './types/ConnectionStatus';
import { EventType } from './types/EventType';
import { logger } from './utils/logger';

jest.mock('./services/RemoteCommunication/ChannelManager');
jest.mock('./services/RemoteCommunication/MessageHandlers');
jest.mock('./services/RemoteCommunication/StorageManager');
jest.mock('./services/RemoteCommunication/ConnectionManager');
jest.mock('./utils/logger');

describe('RemoteCommunication', () => {
  let remoteCommunicationInstance: RemoteCommunication;
  const mockChannelId = 'mockChannelId';
  const mockMessage = { type: 'test', data: 'message' };

  beforeEach(() => {
    jest.clearAllMocks();
    remoteCommunicationInstance = new RemoteCommunication({
      anonId: '123',
      platformType: 'metamask-mobile',
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      context: 'some-context',
    });
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(remoteCommunicationInstance.state.ready).toBe(false);
      expect(remoteCommunicationInstance.state.authorized).toBe(false);
      expect(remoteCommunicationInstance.state.platformType).toStrictEqual(
        'metamask-mobile',
      );
    });
  });

  describe('setConnectionStatus', () => {
    it('should set connection status and emit events', () => {
      const emitSpy = jest.spyOn(remoteCommunicationInstance, 'emit');
      remoteCommunicationInstance.setConnectionStatus(ConnectionStatus.PAUSED);

      expect(remoteCommunicationInstance.state._connectionStatus).toStrictEqual(
        ConnectionStatus.PAUSED,
      );

      expect(emitSpy).toHaveBeenCalledWith(
        EventType.CONNECTION_STATUS,
        ConnectionStatus.PAUSED,
      );

      expect(emitSpy).toHaveBeenCalledWith(
        EventType.SERVICE_STATUS,
        expect.anything(),
      );
    });

    it('should not re-emit if status is same', () => {
      const emitSpy = jest.spyOn(remoteCommunicationInstance, 'emit');
      remoteCommunicationInstance.setConnectionStatus(ConnectionStatus.PAUSED);
      emitSpy.mockClear();
      remoteCommunicationInstance.setConnectionStatus(ConnectionStatus.PAUSED);
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('isReady', () => {
    it('should return the ready state', () => {
      expect(remoteCommunicationInstance.isReady()).toBe(false);
      remoteCommunicationInstance.state.ready = true;
      expect(remoteCommunicationInstance.isReady()).toBe(true);
    });
  });

  describe('isConnected', () => {
    it('should return false when communicationLayer is undefined', () => {
      expect(remoteCommunicationInstance.isConnected()).toBeUndefined();
    });

    it('should return communicationLayer isConnected state', () => {
      remoteCommunicationInstance.state.communicationLayer = {
        isConnected: jest.fn().mockReturnValue(true),
      } as unknown as SocketService;
      expect(remoteCommunicationInstance.isConnected()).toBe(true);
    });
  });

  describe('isAuthorized', () => {
    it('should return the authorized state', () => {
      expect(remoteCommunicationInstance.isAuthorized()).toBe(false);
      remoteCommunicationInstance.state.authorized = true;
      expect(remoteCommunicationInstance.isAuthorized()).toBe(true);
    });
  });

  describe('isPaused', () => {
    it('should return the paused state', () => {
      expect(remoteCommunicationInstance.isPaused()).toBe(false);
      remoteCommunicationInstance.state.paused = true;
      expect(remoteCommunicationInstance.isPaused()).toBe(true);
    });
  });

  describe('getVersion', () => {
    it('should return the package version', () => {
      expect(remoteCommunicationInstance.getVersion()).toBe(
        packageJson.version,
      );
    });
  });

  describe('getCommunicationLayer', () => {
    it('should return the communicationLayer state', () => {
      const mockCommLayer = {} as unknown as SocketService;
      remoteCommunicationInstance.state.communicationLayer = mockCommLayer;
      expect(remoteCommunicationInstance.getCommunicationLayer()).toBe(
        mockCommLayer,
      );
    });
  });

  describe('ping', () => {
    it('should call communicationLayer ping method if defined and debug state is true', async () => {
      const pingMock = jest.fn();
      remoteCommunicationInstance.state.communicationLayer = {
        ping: pingMock,
      } as unknown as SocketService;
      remoteCommunicationInstance.state.debug = true;
      await remoteCommunicationInstance.ping();
      expect(pingMock).toHaveBeenCalled();
    });
  });

  describe('keyCheck', () => {
    it('should call communicationLayer keyCheck method if defined and debug state is true', () => {
      const keyCheckMock = jest.fn();
      remoteCommunicationInstance.state.communicationLayer = {
        keyCheck: keyCheckMock,
      } as unknown as SocketService;
      remoteCommunicationInstance.state.debug = true;
      remoteCommunicationInstance.keyCheck();
      expect(keyCheckMock).toHaveBeenCalled();
    });
  });

  describe('getConnectionStatus', () => {
    it('should return the current connection status', () => {
      remoteCommunicationInstance.state._connectionStatus =
        ConnectionStatus.DISCONNECTED;

      expect(remoteCommunicationInstance.getConnectionStatus()).toBe(
        ConnectionStatus.DISCONNECTED,
      );
    });
  });

  describe('getServiceStatus', () => {
    it('should return the service status', () => {
      const mockServiceStatus = {
        originatorInfo: undefined,
        keyInfo: undefined,
        connectionStatus: ConnectionStatus.DISCONNECTED,
        channelConfig: undefined,
        channelId: mockChannelId,
      };

      remoteCommunicationInstance.state.originatorInfo =
        mockServiceStatus.originatorInfo;

      remoteCommunicationInstance.state.channelConfig =
        mockServiceStatus.channelConfig;
      remoteCommunicationInstance.state.channelId = mockServiceStatus.channelId;
      remoteCommunicationInstance.state._connectionStatus =
        mockServiceStatus.connectionStatus;

      jest
        .spyOn(remoteCommunicationInstance, 'getKeyInfo')
        .mockReturnValue(mockServiceStatus.keyInfo);

      expect(remoteCommunicationInstance.getServiceStatus()).toStrictEqual(
        mockServiceStatus,
      );
    });
  });

  describe('clean', () => {
    it('should call clean with the current state', () => {
      remoteCommunicationInstance.clean();
      expect(clean).toHaveBeenCalledWith(remoteCommunicationInstance.state);
    });
  });

  describe('sendMessage', () => {
    it('should call sendMessage with the provided message', async () => {
      await remoteCommunicationInstance.sendMessage(mockMessage as any);
      expect(sendMessage).toHaveBeenCalledWith(
        remoteCommunicationInstance,
        mockMessage,
      );
    });
  });

  describe('testStorage', () => {
    it('should call testStorage with the current state', async () => {
      await remoteCommunicationInstance.testStorage();
      expect(testStorage).toHaveBeenCalledWith(
        remoteCommunicationInstance.state,
      );
    });
  });

  describe('getChannelConfig', () => {
    it('should return the channelConfig state', () => {
      const mockChannelConfig = { id: mockChannelId };
      remoteCommunicationInstance.state.channelConfig =
        mockChannelConfig as any;

      expect(remoteCommunicationInstance.getChannelConfig()).toBe(
        mockChannelConfig,
      );
    });
  });

  describe('resetKeys', () => {
    it('should call resetKeys on the communicationLayer if defined', () => {
      const resetKeysMock = jest.fn();
      remoteCommunicationInstance.state.communicationLayer = {
        resetKeys: resetKeysMock,
      } as unknown as SocketService;
      remoteCommunicationInstance.resetKeys();
      expect(resetKeysMock).toHaveBeenCalled();
    });
  });

  describe('setOtherPublicKey', () => {
    it('should call setOtherPublicKey on the key exchange if different', () => {
      const setOtherPublicKeyMock = jest.fn();
      const getOtherPublicKeyMock = jest.fn().mockReturnValue('oldKey');
      remoteCommunicationInstance.state.communicationLayer = {
        getKeyExchange: () => ({
          getOtherPublicKey: getOtherPublicKeyMock,
          setOtherPublicKey: setOtherPublicKeyMock,
        }),
      } as unknown as SocketService;
      remoteCommunicationInstance.setOtherPublicKey('newKey');
      expect(setOtherPublicKeyMock).toHaveBeenCalledWith('newKey');
    });

    it('should throw an error if key exchange is not initialized', () => {
      remoteCommunicationInstance.state.communicationLayer = {
        getKeyExchange: () => undefined,
      } as unknown as SocketService;

      expect(() =>
        remoteCommunicationInstance.setOtherPublicKey('newKey'),
      ).toThrow('KeyExchange is not initialized.');
    });
  });

  describe('pause', () => {
    it('should call pause on the communicationLayer and set connection status to PAUSED', async () => {
      const pauseMock = jest.fn();
      const getKeyInfoMock = jest.fn().mockReturnValue({ key: 'key' });
      const loggerSpy = jest.spyOn(logger, 'RemoteCommunication');
      remoteCommunicationInstance.state.communicationLayer = {
        getKeyInfo: getKeyInfoMock,
        pause: pauseMock,
      } as unknown as SocketService;
      await remoteCommunicationInstance.pause();
      expect(pauseMock).toHaveBeenCalled();
      expect(remoteCommunicationInstance.state._connectionStatus).toBe(
        ConnectionStatus.PAUSED,
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        `[RemoteCommunication: pause()] channel=${remoteCommunicationInstance.state.channelId}`,
      );
    });
  });

  describe('hasRelayPersistence', () => {
    it('should return the relayPersistence state', () => {
      expect(remoteCommunicationInstance.hasRelayPersistence()).toBe(false);
      remoteCommunicationInstance.state.relayPersistence = true;
      expect(remoteCommunicationInstance.hasRelayPersistence()).toBe(true);
    });
  });

  describe('getChannelId', () => {
    it('should return the channelId state', () => {
      remoteCommunicationInstance.state.channelId = mockChannelId;
      expect(remoteCommunicationInstance.getChannelId()).toBe(mockChannelId);
    });
  });

  describe('getRPCMethodTracker', () => {
    it('should return the RPC method tracker from the communication layer if defined', () => {
      const mockRPCMethodTracker = { track: jest.fn() };
      remoteCommunicationInstance.state.communicationLayer = {
        getRPCMethodTracker: () => mockRPCMethodTracker,
      } as unknown as SocketService;

      expect(remoteCommunicationInstance.getRPCMethodTracker()).toBe(
        mockRPCMethodTracker,
      );
    });

    it('should return undefined if communication layer is not defined', () => {
      expect(remoteCommunicationInstance.getRPCMethodTracker()).toBeUndefined();
    });
  });
});
