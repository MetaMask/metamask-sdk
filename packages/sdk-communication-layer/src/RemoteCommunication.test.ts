import packageJson from '../package.json';
import { RemoteCommunication } from './RemoteCommunication';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectionStatus } from './types/ConnectionStatus';
import { EventType } from './types/EventType';

jest.mock('./services/RemoteCommunication/ConnectionManager');

describe('RemoteCommunication', () => {
  let remoteCommunicationInstance: RemoteCommunication;

  beforeEach(() => {
    jest.clearAllMocks();
    remoteCommunicationInstance = new RemoteCommunication({
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
      } as unknown as CommunicationLayer;
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
      const mockCommLayer = {} as unknown as CommunicationLayer;
      remoteCommunicationInstance.state.communicationLayer = mockCommLayer;
      expect(remoteCommunicationInstance.getCommunicationLayer()).toBe(
        mockCommLayer,
      );
    });
  });

  describe('ping', () => {
    it('should call communicationLayer ping method if defined and debug state is true', () => {
      const pingMock = jest.fn();
      remoteCommunicationInstance.state.communicationLayer = {
        ping: pingMock,
        // ...mock other properties if necessary
      } as unknown as CommunicationLayer;
      remoteCommunicationInstance.state.debug = true;
      remoteCommunicationInstance.ping();
      expect(pingMock).toHaveBeenCalled();
    });
  });

  describe('keyCheck', () => {
    it('should call communicationLayer keyCheck method if defined and debug state is true', () => {
      const keyCheckMock = jest.fn();
      remoteCommunicationInstance.state.communicationLayer = {
        keyCheck: keyCheckMock,
      } as unknown as CommunicationLayer;
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
        channelId: 'mockChannelId',
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
});
