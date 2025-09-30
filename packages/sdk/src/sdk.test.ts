import { v4 as uuidv4 } from 'uuid';
import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import packageJson from '../package.json';
import { SDKProvider } from './provider/SDKProvider';
import { MetaMaskSDK, MetaMaskSDKOptions } from './sdk';
import { Analytics } from './services/Analytics';
import { connectAndSign } from './services/MetaMaskSDK/ConnectionManager/connectAndSign';
import { connectWith } from './services/MetaMaskSDK/ConnectionManager/connectWith';
import { RemoteConnection } from './services/RemoteConnection';
import { PlatformManager } from './Platform/PlatfformManager';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));
jest.mock('./services/MetaMaskSDK/InitializerManager');
jest.mock('./services/MetaMaskSDK/ConnectionManager');
jest.mock('./services/RemoteConnection');
jest.mock('./services/MetaMaskSDK/ConnectionManager/connectAndSign');
jest.mock('./services/MetaMaskSDK/ConnectionManager/connectWith');
jest.mock('./Platform/PlatfformManager');

// Mock global localStorage for browser tests
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
global.localStorage = mockLocalStorage as any;

// Mock AsyncStorage module
jest.mock(
  '@react-native-async-storage/async-storage',
  () => ({
    default: {
      getItem: jest.fn(),
      setItem: jest.fn(),
    },
  }),
  { virtual: true },
);

describe('MetaMaskSDK', () => {
  let sdk: MetaMaskSDK;
  const mockDappName = 'Mock DApp Name';
  const mockDappUrl = 'http://mockdapp.com';
  const mockHostname = 'mockdapp.com';

  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue('mock-uuid');

    sdk = new MetaMaskSDK({
      dappMetadata: {
        name: mockDappName,
        url: mockDappUrl,
      },
    });
    sdk.platformManager = new PlatformManager({ useDeepLink: false });
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

    it('should connect and sign', async () => {
      const msg = 'test message';
      await sdk.connectAndSign({ msg });
      expect(connectAndSign).toHaveBeenCalledWith({ instance: sdk, msg });
    });

    it('should connect with RPC method', async () => {
      const rpc = { method: 'test_method', params: [] };
      await sdk.connectWith(rpc);
      expect(connectWith).toHaveBeenCalledWith({ instance: sdk, rpc });
    });
  });

  describe('Provider Handling', () => {
    it('should get provider', () => {
      const mockProvider = {};

      sdk.activeProvider = mockProvider as SDKProvider;
      expect(sdk.getProvider()).toBe(mockProvider);
    });

    it('should log warn message when getting undefined provider', () => {
      const spyConsoleWarn = jest.spyOn(console, 'warn');
      sdk.getProvider();

      expect(spyConsoleWarn).toHaveBeenCalledWith(
        'MetaMaskSDK: No active provider found',
      );
    });

    it('should get mobile provider', () => {
      const mockProvider = {};

      sdk.sdkProvider = mockProvider as SDKProvider;
      expect(sdk.getMobileProvider()).toBe(mockProvider);
    });

    it('should throw error if mobile provider is undefined', () => {
      sdk.sdkProvider = undefined;
      expect(() => sdk.getMobileProvider()).toThrow(
        'SDK state invalid -- undefined mobile provider',
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
        'You must provide dAppMetadata url',
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

    it('should initialize with hideReturnToAppNotification option', () => {
      const options: MetaMaskSDKOptions = {
        hideReturnToAppNotification: true,
        dappMetadata: {
          name: 'Test DApp',
          url: 'http://test-dapp.com',
        },
      };

      sdk = new MetaMaskSDK(options);

      expect(sdk.options.hideReturnToAppNotification).toBe(true);
    });

    it('should have hideReturnToAppNotification as undefined by default', () => {
      const options: MetaMaskSDKOptions = {
        dappMetadata: {
          name: 'Test DApp',
          url: 'http://test-dapp.com',
        },
      };

      sdk = new MetaMaskSDK(options);

      expect(sdk.options.hideReturnToAppNotification).toBeFalsy();
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

    describe('getDappId', () => {
      const originalWindow = global.window;

      afterEach(() => {
        global.window = originalWindow;
      });

      it('should return window.location.hostname if window and window.location are defined', () => {
        global.window = {
          location: {
            hostname: mockHostname,
          },
        } as any;
        expect(sdk.getDappId()).toBe(mockHostname);
      });

      it('should return dappMetadata.name if window is undefined and name is available', () => {
        global.window = undefined as any;
        sdk.options.dappMetadata = { name: mockDappName, url: mockDappUrl };
        expect(sdk.getDappId()).toBe(mockDappName);
      });

      it('should return dappMetadata.url if window is undefined and name is not available but url is', () => {
        global.window = undefined as any;
        sdk.options.dappMetadata = { url: mockDappUrl };
        expect(sdk.getDappId()).toBe(mockDappUrl);
      });

      it('should return "N/A" if window is undefined and neither name nor url is available', () => {
        global.window = undefined as any;
        sdk.options.dappMetadata = {};
        expect(sdk.getDappId()).toBe('N/A');
      });
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

    describe('Anonymous ID Management', () => {
      const mockAnonId = 'test-anon-id';
      const ANON_ID_STORAGE_KEY = 'mm-sdk-anon-id';

      beforeEach(() => {
        // @ts-expect-error - accessing private member
        sdk._anonId = undefined;
      });

      describe('getAnonId', () => {
        it('should return existing _anonId if already set', async () => {
          // @ts-expect-error - accessing private member
          sdk._anonId = mockAnonId;
          expect(await sdk.getAnonId()).toBe(mockAnonId);
        });

        it('should call getBrowserAnonId if platform is browser', async () => {
          jest
            .spyOn(sdk.platformManager as PlatformManager, 'isBrowser')
            .mockReturnValue(true);

          jest
            .spyOn(sdk.platformManager as PlatformManager, 'isReactNative')
            .mockReturnValue(false);
          const browserAnonIdSpy = jest
            .spyOn(sdk as any, 'getBrowserAnonId')
            .mockReturnValue('browser-id');

          expect(await sdk.getAnonId()).toBe('browser-id');
          expect(browserAnonIdSpy).toHaveBeenCalled();
        });

        it('should call getReactNativeAnonId if platform is ReactNative', async () => {
          jest
            .spyOn(sdk.platformManager as PlatformManager, 'isBrowser')
            .mockReturnValue(false);

          jest
            .spyOn(sdk.platformManager as PlatformManager, 'isReactNative')
            .mockReturnValue(true);
          const rnAnonIdSpy = jest
            .spyOn(sdk as any, 'getReactNativeAnonId')
            .mockResolvedValue('rn-id');

          expect(await sdk.getAnonId()).toBe('rn-id');
          expect(rnAnonIdSpy).toHaveBeenCalled();
        });

        it('should generate a new uuid if platform is neither browser nor ReactNative', async () => {
          jest
            .spyOn(sdk.platformManager as PlatformManager, 'isBrowser')
            .mockReturnValue(false);

          jest
            .spyOn(sdk.platformManager as PlatformManager, 'isReactNative')
            .mockReturnValue(false);
          (uuidv4 as jest.Mock).mockReturnValue('new-uuid');

          expect(await sdk.getAnonId()).toBe('new-uuid');
          expect(uuidv4).toHaveBeenCalled();
        });
      });

      describe('getBrowserAnonId (tested via getAnonId)', () => {
        beforeEach(() => {
          // Reset mocks
          mockLocalStorage.getItem.mockReset();
          mockLocalStorage.setItem.mockReset();

          jest
            .spyOn(sdk.platformManager as PlatformManager, 'isBrowser')
            .mockReturnValue(true);

          jest
            .spyOn(sdk.platformManager as PlatformManager, 'isReactNative')
            .mockReturnValue(false);
        });

        it('should return stored ID from localStorage if available', async () => {
          mockLocalStorage.getItem.mockReturnValue(mockAnonId);

          expect(await sdk.getAnonId()).toBe(mockAnonId);
          expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
            ANON_ID_STORAGE_KEY,
          );
          expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });

        it('should generate, store, and return a new ID if not in localStorage', async () => {
          mockLocalStorage.getItem.mockReturnValue(null);
          (uuidv4 as jest.Mock).mockReturnValue('new-browser-uuid');

          expect(await sdk.getAnonId()).toBe('new-browser-uuid');
          expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
            ANON_ID_STORAGE_KEY,
          );

          expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
            ANON_ID_STORAGE_KEY,
            'new-browser-uuid',
          );
          expect(uuidv4).toHaveBeenCalled();
        });

        it('should generate a new UUID if localStorage access throws an error', async () => {
          mockLocalStorage.getItem.mockImplementation(() => {
            throw new Error('LocalStorage Read Error');
          });
          (uuidv4 as jest.Mock).mockReturnValue('error-fallback-uuid');
          const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation();

          expect(await sdk.getAnonId()).toBe('error-fallback-uuid');
          expect(uuidv4).toHaveBeenCalled();
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[MetaMaskSDK: getBrowserAnonId()] LocalStorage access error:',
            expect.any(Error),
          );
          consoleErrorSpy.mockRestore();
        });
      });

      describe('getReactNativeAnonId (tested via getAnonId)', () => {
        let mockAsyncStorage: { getItem: jest.Mock; setItem: jest.Mock };

        beforeEach(() => {
          mockAsyncStorage = jest.requireMock(
            '@react-native-async-storage/async-storage',
          ).default;

          // Reset the _anonId to ensure clean tests
          // @ts-expect-error - accessing private member
          sdk._anonId = undefined;

          jest
            .spyOn(sdk.platformManager as PlatformManager, 'isBrowser')
            .mockReturnValue(false);

          jest
            .spyOn(sdk.platformManager as PlatformManager, 'isReactNative')
            .mockReturnValue(true);
        });

        it('should return stored ID from AsyncStorage if available', async () => {
          mockAsyncStorage.getItem.mockResolvedValue(mockAnonId);

          expect(await sdk.getAnonId()).toBe(mockAnonId);
          expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
            ANON_ID_STORAGE_KEY,
          );
          expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
        });

        it('should generate, store, and return a new ID if not in AsyncStorage', async () => {
          mockAsyncStorage.getItem.mockResolvedValue(null);
          (uuidv4 as jest.Mock).mockReturnValue('new-rn-uuid');

          expect(await sdk.getAnonId()).toBe('new-rn-uuid');
          expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
            ANON_ID_STORAGE_KEY,
          );

          expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
            ANON_ID_STORAGE_KEY,
            'new-rn-uuid',
          );
          expect(uuidv4).toHaveBeenCalled();
        });

        it('should generate a new UUID if AsyncStorage access throws an error', async () => {
          mockAsyncStorage.getItem.mockRejectedValue(
            new Error('AsyncStorage Read Error'),
          );
          (uuidv4 as jest.Mock).mockReturnValue('rn-error-fallback-uuid');
          const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation();

          expect(await sdk.getAnonId()).toBe('rn-error-fallback-uuid');
          expect(uuidv4).toHaveBeenCalled();
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[MetaMaskSDK: getReactNativeAnonId()] Error accessing AsyncStorage:',
            expect.any(Error),
          );
          consoleErrorSpy.mockRestore();
        });
      });
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

    it('should set read-only RPC calls', () => {
      sdk.setReadOnlyRPCCalls(true);
      expect(sdk.hasReadOnlyRPCCalls()).toBe(true);

      sdk.setReadOnlyRPCCalls(false);
      expect(sdk.hasReadOnlyRPCCalls()).toBe(false);
    });

    it('should get channel ID', () => {
      const mockChannelId = 'mockChannelId';
      sdk.remoteConnection = {
        getChannelConfig: jest
          .fn()
          .mockReturnValue({ channelId: mockChannelId }),
      } as unknown as RemoteConnection;
      expect(sdk.getChannelId()).toBe(mockChannelId);
    });

    it('should get RPC history', () => {
      const mockRPCHistory = {};
      sdk.remoteConnection = {
        getConnector: jest.fn().mockReturnValue({
          getRPCMethodTracker: jest.fn().mockReturnValue(mockRPCHistory),
        }),
      } as unknown as RemoteConnection;
      expect(sdk.getRPCHistory()).toBe(mockRPCHistory);
    });

    it('should get SDK version', () => {
      expect(sdk.getVersion()).toBe(packageJson.version);
    });

    it('should get wallet status', () => {
      const mockStatus = 'connected';
      sdk.remoteConnection = {
        getConnector: jest.fn().mockReturnValue({
          getConnectionStatus: jest.fn().mockReturnValue(mockStatus),
        }),
      } as unknown as RemoteConnection;
      expect(sdk.getWalletStatus()).toBe(mockStatus);
    });
  });

  describe('Deprecated Methods', () => {
    it('should log warning and call terminate when disconnect is called', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      const terminateSpy = jest.spyOn(sdk, 'terminate');

      await sdk.disconnect();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'MetaMaskSDK.disconnect() is deprecated, use terminate()',
      );
      expect(terminateSpy).toHaveBeenCalled();
    });
  });
});
