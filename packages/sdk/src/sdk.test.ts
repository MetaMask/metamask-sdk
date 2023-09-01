import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { SDKProvider } from './provider/SDKProvider';
import { MetaMaskSDK, MetaMaskSDKOptions } from './sdk';
import { RemoteConnection } from './services/RemoteConnection';
import { Analytics } from './services/Analytics';

jest.mock('./services/MetaMaskSDK/InitializerManager');
jest.mock('./services/MetaMaskSDK/ConnectionManager');
jest.mock('./services/RemoteConnection');

describe('MetaMaskSDK', () => {
  let sdk: MetaMaskSDK;

  beforeEach(() => {
    jest.clearAllMocks();

    sdk = new MetaMaskSDK({
      dappMetadata: {
        name: 'Mock Name',
        url: 'http://mockurl.com',
      },
    });
  });

  describe('Initialization', () => {
    it('should be initialized correctly', () => {
      expect(sdk).toBeDefined();
      expect(sdk.isInitialized()).toBe(false);
    });

    it('should initialize SDK', async () => {
      const initSpy = jest.spyOn(sdk, 'init');
      await sdk.init();
      expect(initSpy).toHaveBeenCalled();
    });

    it('should throw error if initialization fails', async () => {
      const initSpy = jest
        .spyOn(sdk, 'init')
        .mockRejectedValue(new Error('Initialization failed'));

      await expect(sdk.init()).rejects.toThrow('Initialization failed');
      expect(initSpy).toHaveBeenCalled();
    });
  });

  describe('Connection Management', () => {
    it('should connect', async () => {
      const connectSpy = jest.spyOn(sdk, 'connect');
      await sdk.connect();
      expect(connectSpy).toHaveBeenCalled();
    });

    it('should resume', async () => {
      const resumeSpy = jest.spyOn(sdk, 'resume');
      await sdk.resume();
      expect(resumeSpy).toHaveBeenCalled();
    });

    it('should terminate', async () => {
      const terminateSpy = jest.spyOn(sdk, 'terminate');
      await sdk.terminate();
      expect(terminateSpy).toHaveBeenCalled();
    });

    it('should disconnect correctly', () => {
      sdk.remoteConnection = {
        disconnect: jest.fn(),
      } as unknown as RemoteConnection;

      sdk.disconnect();

      expect(sdk.remoteConnection.disconnect).toHaveBeenCalled();
    });
  });

  describe('Provider Handling', () => {
    it('should get provider', () => {
      const mockProvider = {};

      sdk.activeProvider = mockProvider as SDKProvider;
      expect(sdk.getProvider()).toBe(mockProvider);
    });

    it('should throw error when getting undefined provider', () => {
      expect(() => sdk.getProvider()).toThrow(
        'SDK state invalid -- undefined provider',
      );
    });

    it('should throw error if SDK is not initialized when calling getProvider', () => {
      sdk.activeProvider = undefined;
      expect(() => sdk.getProvider()).toThrow(
        'SDK state invalid -- undefined provider',
      );
    });
  });

  describe('Universal Link', () => {
    it('should return Universal Link', () => {
      const mockUniversalLink = 'mock://link';
      sdk.remoteConnection = {
        getUniversalLink: jest.fn().mockReturnValue(mockUniversalLink),
      } as unknown as RemoteConnection;
      expect(sdk.getUniversalLink()).toBe(mockUniversalLink);
    });

    it('should throw error when Universal Link is unavailable', () => {
      expect(() => sdk.getUniversalLink()).toThrow(
        'No Universal Link available, please call eth_requestAccounts first.',
      );
    });
  });

  describe('Authorization', () => {
    it('should return correct authorization status', () => {
      sdk.remoteConnection = {
        isAuthorized: jest.fn(),
      } as unknown as RemoteConnection;

      sdk.isAuthorized();

      expect(sdk.remoteConnection.isAuthorized).toHaveBeenCalled();
    });
  });

  describe('Metadata and Configuration', () => {
    it('should return correct dAppMetadata', () => {
      const dAppMetadata = sdk._getDappMetadata();

      expect(dAppMetadata).toStrictEqual(sdk.dappMetadata);
    });

    it('should throw error if dappMetadata is missing', () => {
      expect(() => new MetaMaskSDK({} as MetaMaskSDKOptions)).toThrow(
        'You must provide dAppMetadata option (name and/or url)',
      );
    });

    it('should initialize with correct options', () => {
      const options: MetaMaskSDKOptions = {
        injectProvider: false,
        dappMetadata: {
          name: 'Test DApp',
          url: 'http://test-dapp.com',
        },
        communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      };

      sdk = new MetaMaskSDK(options);

      expect(sdk.options).toMatchObject(options);
    });

    it('should set max listeners', () => {
      expect(sdk.getMaxListeners()).toBe(50);
    });

    it('should configure modals correctly', () => {
      const mockModals = {};

      sdk = new MetaMaskSDK({
        modals: mockModals,
        dappMetadata: {
          name: 'Mock Name',
          url: 'http://mockurl.com',
        },
      });

      expect(sdk.options.modals).toBe(mockModals);
    });
  });

  describe('Analytics and Extensions', () => {
    it('should attach an Analytics service if provided', () => {
      const mockAnalytics = {};

      sdk.analytics = mockAnalytics as Analytics;

      expect(sdk.analytics).toBe(mockAnalytics);
    });

    it('should validate if extension is active', () => {
      sdk.extensionActive = true;
      expect(sdk.isExtensionActive()).toBe(true);
    });
  });

  describe('Desktop and Modals', () => {
    it('should not inject a provider when injectProvider option is false', () => {
      sdk = new MetaMaskSDK({
        injectProvider: false,
        dappMetadata: {
          name: 'Test DApp',
          url: 'http://test-dapp.com',
        },
      });

      expect(sdk.activeProvider).toBeUndefined();
    });

    it('should have a desktop preference when preferDesktop is true', () => {
      sdk = new MetaMaskSDK({
        preferDesktop: true,
        dappMetadata: {
          name: 'Test DApp',
          url: 'http://test-dapp.com',
        },
      });

      expect(sdk.options.preferDesktop).toBe(true);
    });
  });

  describe('State Management', () => {
    it('should get channel config', () => {
      const mockConfig = {};
      sdk.remoteConnection = {
        getChannelConfig: jest.fn().mockReturnValue(mockConfig),
      } as unknown as RemoteConnection;
      expect(sdk._getChannelConfig()).toBe(mockConfig);
    });

    it('should ping the connector', () => {
      const mockConnector = {
        ping: jest.fn(),
      };
      sdk.remoteConnection = {
        getConnector: jest.fn().mockReturnValue(mockConnector),
      } as unknown as RemoteConnection;
      sdk._ping();
      expect(mockConnector.ping).toHaveBeenCalled();
    });

    it('should check key on the connector', () => {
      const mockConnector = {
        keyCheck: jest.fn(),
      };
      sdk.remoteConnection = {
        getConnector: jest.fn().mockReturnValue(mockConnector),
      } as unknown as RemoteConnection;
      sdk._keyCheck();
      expect(mockConnector.keyCheck).toHaveBeenCalled();
    });

    it('should get service status', () => {
      const mockStatus = 'OK';
      const mockConnector = {
        getServiceStatus: jest.fn().mockReturnValue(mockStatus),
      };
      sdk.remoteConnection = {
        getConnector: jest.fn().mockReturnValue(mockConnector),
      } as unknown as RemoteConnection;
      expect(sdk._getServiceStatus()).toBe(mockStatus);
    });

    it('should get remote connection', () => {
      expect(sdk._getRemoteConnection()).toBe(sdk.remoteConnection);
    });

    it('should get key info', () => {
      const mockKeyInfo = {};
      sdk.remoteConnection = {
        getKeyInfo: jest.fn().mockReturnValue(mockKeyInfo),
      } as unknown as RemoteConnection;
      expect(sdk._getKeyInfo()).toBe(mockKeyInfo);
    });

    it('should reset keys on the connector', () => {
      const mockConnector = {
        resetKeys: jest.fn(),
      };
      sdk.remoteConnection = {
        getConnector: jest.fn().mockReturnValue(mockConnector),
      } as unknown as RemoteConnection;
      sdk._resetKeys();
      expect(mockConnector.resetKeys).toHaveBeenCalled();
    });

    it('should get connection', () => {
      expect(sdk._getConnection()).toBe(sdk.remoteConnection);
    });
  });
});
