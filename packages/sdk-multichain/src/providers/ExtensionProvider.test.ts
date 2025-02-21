import { MetaMaskInpageProvider } from '@metamask/providers';
import { Duplex } from 'readable-stream';
import { ExtensionProvider, ProviderType } from './ExtensionProvider';

// Mock chrome runtime
const mockChromeRuntime = {
  connect: jest.fn(),
  disconnect: jest.fn(),
};

const mockPort = {
  onMessage: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
  },
  onDisconnect: {
    addListener: jest.fn(),
  },
  postMessage: jest.fn(),
  disconnect: jest.fn(),
};

// Mock logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Mock MetaMaskInpageProvider
jest.mock('@metamask/providers', () => ({
  MetaMaskInpageProvider: jest.fn().mockImplementation(() => ({
    request: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    _state: {
      stream: {
        destroy: jest.fn(),
      },
    },
  })),
}));

const MockMetaMaskInpageProvider = MetaMaskInpageProvider as jest.MockedClass<typeof MetaMaskInpageProvider>;

describe('ExtensionProvider', () => {
  let provider: ExtensionProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup chrome mock
    (global as any).chrome = {
      runtime: mockChromeRuntime,
    };
    mockChromeRuntime.connect.mockReturnValue(mockPort);
  });

  afterEach(() => {
    delete (global as any).chrome;
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      provider = new ExtensionProvider();
      expect(provider).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const mockEip1193Provider = new MetaMaskInpageProvider({} as Duplex);
      provider = new ExtensionProvider({
        logger: mockLogger,
        eip1193Provider: mockEip1193Provider,
        preferredProvider: ProviderType.EIP1193_PROVIDER,
      });
      expect(provider).toBeDefined();
      expect(mockLogger.debug).toHaveBeenCalled();
    });
  });

  describe('connect', () => {
    it('should connect using existing provider if available', async () => {
      const mockEip1193Provider = new MetaMaskInpageProvider({} as Duplex);
      provider = new ExtensionProvider({
        logger: mockLogger,
        eip1193Provider: mockEip1193Provider,
      });

      const result = await provider.connect();
      expect(result).toBe(true);
    });

    it('should connect using chrome runtime if extensionId provided', async () => {
      provider = new ExtensionProvider({ logger: mockLogger });
      const result = await provider.connect({ extensionId: 'test-id' });

      expect(mockChromeRuntime.connect).toHaveBeenCalledWith('test-id');
      expect(mockPort.onMessage.addListener).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should connect using stream if provided', async () => {
      const mockStream = new Duplex();
      provider = new ExtensionProvider({
        logger: mockLogger,
        existingStream: mockStream,
      });

      const result = await provider.connect();
      expect(result).toBe(true);
      expect(MetaMaskInpageProvider).toHaveBeenCalled();
    });

    it('should throw error if no valid provider available', async () => {
      provider = new ExtensionProvider({ logger: mockLogger });
      await expect(provider.connect()).rejects.toThrow('No valid provider available');
    });
  });

  describe('disconnect', () => {
    it('should disconnect chrome port if connected', async () => {
      provider = new ExtensionProvider({ logger: mockLogger });
      await provider.connect({ extensionId: 'test-id' });
      provider.disconnect();

      expect(mockPort.disconnect).toHaveBeenCalled();
    });

    it('should clean up stream provider if connected', async () => {
      const mockStream = new Duplex();
      provider = new ExtensionProvider({
        logger: mockLogger,
        existingStream: mockStream,
      });
      await provider.connect();
      provider.disconnect();

      const mockProvider = MockMetaMaskInpageProvider.mock.results[0].value;
      expect(mockProvider.removeAllListeners).toHaveBeenCalled();
    });
  });

  describe('request', () => {
    it('should throw error if not connected', async () => {
      provider = new ExtensionProvider();
      await expect(provider.request({ method: 'test' })).rejects.toThrow('Not connected');
    });

    it('should use existing provider if preferred', async () => {
      const mockEip1193Provider = new MetaMaskInpageProvider({} as Duplex);
      (mockEip1193Provider.request as jest.Mock).mockResolvedValue('result');

      provider = new ExtensionProvider({
        logger: mockLogger,
        eip1193Provider: mockEip1193Provider,
        preferredProvider: ProviderType.EIP1193_PROVIDER,
      });
      await provider.connect();

      const result = await provider.request({ method: 'test' });
      expect(result).toBe('result');
      expect(mockEip1193Provider.request).toHaveBeenCalled();
    });

    it('should use chrome runtime if preferred', async () => {
      // Mock chrome.runtime properly
      (global as any).chrome = {
        runtime: {
          connect: jest.fn().mockReturnValue({
            ...mockPort,
            onDisconnect: {
              addListener: jest.fn()
            }
          })
        }
      };

      provider = new ExtensionProvider({
        logger: mockLogger,
        preferredProvider: ProviderType.CHROME_EXTENSION
      });

      // Initialize messageHandler before using it
      const messageHandler = jest.fn();
      mockPort.onMessage.addListener.mockImplementation((handler) => {
        messageHandler(handler);
      });

      await provider.connect({ extensionId: 'test-id' });
      const requestPromise = provider.request({ method: 'test' });

      // Get the actual handler from the mock call
      const actualHandler = messageHandler.mock.calls[0][0];
      actualHandler({
        data: {
          id: 1,
          result: 'chrome-result'
        }
      });

      const result = await requestPromise;
      expect(result).toBe('chrome-result');
    }, 1000);
  });

  describe('notification handling', () => {
    it('should handle notifications from chrome runtime', async () => {
      const notificationCallback = jest.fn();
      provider = new ExtensionProvider({ logger: mockLogger });
      provider.onNotification(notificationCallback);

      // Connect first, then simulate notification
      await provider.connect({ extensionId: 'test-id' });

      // Ensure port is connected before simulating message
      expect(mockPort.onMessage.addListener).toHaveBeenCalled();

      const messageCallback = mockPort.onMessage.addListener.mock.calls[0][0];
      messageCallback({ data: { type: 'notification', message: 'test' } });

      expect(notificationCallback).toHaveBeenCalledWith({
        type: 'notification',
        message: 'test'
      });
    });

    it('should remove specific notification listener', () => {
      const callback = jest.fn();
      provider = new ExtensionProvider();
      provider.onNotification(callback);
      provider.removeNotificationListener(callback);

      // Verify callback was removed (implementation specific)
      expect(provider['notificationCallbacks'].size).toBe(0);
    });

    it('should remove all notification listeners', () => {
      provider = new ExtensionProvider();
      provider.onNotification(jest.fn());
      provider.onNotification(jest.fn());
      provider.removeAllNotificationListeners();

      expect(provider['notificationCallbacks'].size).toBe(0);
    });
  });
});
