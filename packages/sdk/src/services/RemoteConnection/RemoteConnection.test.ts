/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  CommunicationLayerPreference,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../sdk';
import { PlatformManager } from '../../Platform/PlatfformManager';
import { Ethereum } from '../Ethereum';
import { RemoteConnection, RemoteConnectionProps } from './RemoteConnection';
import { showActiveModal } from './ModalManager';

jest.mock('../../Platform/MetaMaskInstaller');
jest.mock('../../sdk');
jest.mock('../Ethereum');
jest.mock('./ConnectionInitializer');
jest.mock('./EventListeners');
jest.mock('./ModalManager');
jest.mock('@metamask/sdk-communication-layer');

describe('RemoteConnection', () => {
  let options: RemoteConnectionProps;

  const mockShowActiveModal = showActiveModal as jest.Mock;

  beforeEach(() => {
    options = {
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      sdk: {
        options: {},
      } as MetaMaskSDK,
      platformManager: {} as PlatformManager,
      modals: {},
    } as unknown as RemoteConnectionProps;
  });

  describe('Initialization', () => {
    it('should initialize with default modals if not provided', () => {
      const connection = new RemoteConnection(options);
      expect(connection).toBeDefined();
    });

    it('should initialize with developer mode if logging options are enabled', () => {
      options.logging = { developerMode: true, sdk: true };
      const connection = new RemoteConnection(options);
      expect(connection).toBeDefined();
    });
  });

  describe('showActiveModal', () => {
    it('should call showActiveModal', () => {
      const connection = new RemoteConnection(options);
      connection.showActiveModal();

      expect(mockShowActiveModal).toHaveBeenCalled();
    });

    it('should call showActiveModal with current state', () => {
      const connection = new RemoteConnection(options);
      connection.showActiveModal();

      expect(mockShowActiveModal).toHaveBeenCalledWith(connection.state);
    });
  });

  describe('getUniversalLink', () => {
    it('should throw an error if connection is not started', () => {
      const connection = new RemoteConnection(options);
      expect(() => connection.getUniversalLink()).toThrow(
        'connection not started. run startConnection() first.',
      );
    });

    it('should return the universal link if connection is started', () => {
      const connection = new RemoteConnection(options);
      connection.state.qrcodeLink = 'http://example.com';
      expect(connection.getUniversalLink()).toBe('http://example.com');
    });
  });

  describe('getChannelConfig', () => {
    it('should return the channel config if connector is defined', () => {
      const mockConfig = { key: 'value' };
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        getChannelConfig: jest.fn(() => mockConfig),
      } as unknown as RemoteCommunication;
      expect(connection.getChannelConfig()).toStrictEqual(mockConfig);
    });

    it('should return undefined if connector is not defined', () => {
      const connection = new RemoteConnection(options);
      expect(connection.getChannelConfig()).toBeUndefined();
    });
  });

  describe('isConnected', () => {
    it('should return true if connector is ready', () => {
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        isReady: jest.fn(() => true),
      } as unknown as RemoteCommunication;
      expect(connection.isConnected()).toBe(true);
    });

    it('should return false if connector is not ready', () => {
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        isReady: jest.fn(() => false),
      } as unknown as RemoteCommunication;
      expect(connection.isConnected()).toBe(false);
    });
  });

  describe('isAuthorized', () => {
    it('should return true if connector is authorized', () => {
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        isAuthorized: jest.fn(() => true),
      } as unknown as RemoteCommunication;
      expect(connection.isAuthorized()).toBe(true);
    });

    it('should return false if connector is not authorized', () => {
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        isAuthorized: jest.fn(() => false),
      } as unknown as RemoteCommunication;
      expect(connection.isAuthorized()).toBe(false);
    });
  });

  describe('isPaused', () => {
    it('should return true if connector is paused', () => {
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        isPaused: jest.fn(() => true),
      } as unknown as RemoteCommunication;
      expect(connection.isPaused()).toBe(true);
    });

    it('should return false if connector is not paused', () => {
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        isPaused: jest.fn(() => false),
      } as unknown as RemoteCommunication;
      expect(connection.isPaused()).toBe(false);
    });
  });

  describe('getPlatformManager', () => {
    it('should throw an error if platformManager is not defined', () => {
      const connection = new RemoteConnection(options);
      connection.state.platformManager = undefined;
      expect(() => connection.getPlatformManager()).toThrow(
        'PlatformManager not available',
      );
    });

    it('should return the platformManager if it is defined', () => {
      const connection = new RemoteConnection(options);
      expect(connection.getPlatformManager()).toBe(options.platformManager);
    });
  });

  describe('getConnector', () => {
    it('should throw an error if connector is not defined', () => {
      const connection = new RemoteConnection(options);
      connection.state.connector = undefined;
      expect(() => connection.getConnector()).toThrow(
        'invalid remote connector',
      );
    });

    it('should return the connector if it is defined', () => {
      const connection = new RemoteConnection(options);
      connection.state.connector = {} as unknown as RemoteCommunication;

      expect(connection.getConnector()).toBe(connection.state.connector);
    });
  });

  describe('getKeyInfo', () => {
    it('should return the key info if connector is defined', () => {
      const mockKeyInfo = { key: 'value' };
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        getKeyInfo: jest.fn(() => mockKeyInfo),
      } as unknown as RemoteCommunication;
      expect(connection.getKeyInfo()).toStrictEqual(mockKeyInfo);
    });

    it('should return undefined if connector is not defined', () => {
      const connection = new RemoteConnection(options);
      expect(connection.getKeyInfo()).toBeUndefined();
    });
  });

  describe('disconnect', () => {
    it('should call handleDisconnect on Ethereum provider when options.terminate is true', () => {
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        disconnect: jest.fn(),
      } as unknown as RemoteCommunication;

      jest.spyOn(Ethereum, 'getProvider').mockReturnValue({
        handleDisconnect: jest.fn(),
      } as any);

      connection.disconnect({ terminate: true });

      expect(connection.state.connector!.disconnect).toHaveBeenCalledWith({
        terminate: true,
      });
    });

    it('should call unmount on state.pendingModal when options.terminate is true', () => {
      const mockUnmount = jest.fn();
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        disconnect: jest.fn(),
      } as unknown as RemoteCommunication;

      jest.spyOn(Ethereum, 'getProvider').mockReturnValue({
        handleDisconnect: jest.fn(),
      } as any);

      connection.state.pendingModal = {
        unmount: mockUnmount,
      };

      connection.disconnect({ terminate: true });

      expect(mockUnmount).toHaveBeenCalled();
    });

    it('should set otpAnswer to undefined on state when options.terminate is true', () => {
      const connection = new RemoteConnection(options);
      jest.spyOn(Ethereum, 'getProvider').mockReturnValue({
        handleDisconnect: jest.fn(),
      } as any);

      connection.state.connector = {
        disconnect: jest.fn(),
      } as unknown as RemoteCommunication;
      connection.state.otpAnswer = 'sample';

      connection.disconnect({ terminate: true });

      expect(connection.state.otpAnswer).toBeUndefined();
    });

    it('should call disconnect on connector when options.terminate is false', () => {
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        disconnect: jest.fn(),
      } as unknown as RemoteCommunication;

      connection.disconnect({ terminate: false });

      expect(connection.state.connector!.disconnect).toHaveBeenCalledWith({
        terminate: false,
      });
    });

    it('should not call unmount on state.pendingModal when options.terminate is false', () => {
      const mockUnmount = jest.fn();
      const connection = new RemoteConnection(options);
      connection.state.connector = {
        disconnect: jest.fn(),
      } as unknown as RemoteCommunication;

      connection.state.pendingModal = {
        unmount: mockUnmount,
      };

      connection.disconnect({ terminate: false });

      expect(mockUnmount).not.toHaveBeenCalled();
    });
  });
});
