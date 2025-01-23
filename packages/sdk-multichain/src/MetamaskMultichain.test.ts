import { MetamaskMultichain } from './MetamaskMultichain';
import { ExtensionProvider } from './providers/ExtensionProvider';
import { SessionData } from './types';

// Mock ExtensionProvider
jest.mock('./providers/ExtensionProvider');

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

describe('MetamaskMultichain', () => {
  let multichain: MetamaskMultichain;
  let mockProvider: jest.Mocked<ExtensionProvider>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProvider = new ExtensionProvider() as jest.Mocked<ExtensionProvider>;
    (ExtensionProvider as jest.Mock).mockImplementation(() => mockProvider);
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      multichain = new MetamaskMultichain();
      expect(multichain).toBeDefined();
      expect(ExtensionProvider).toHaveBeenCalled();
    });
  });

  describe('connect', () => {
    it('should connect via provider', async () => {
      mockProvider.connect.mockResolvedValue(true);
      multichain = new MetamaskMultichain({ logger: mockLogger });

      const result = await multichain.connect({ extensionId: 'test-id' });

      expect(result).toBe(true);
      expect(mockProvider.connect).toHaveBeenCalledWith({ extensionId: 'test-id' });
    });
  });

  describe('session management', () => {
    beforeEach(() => {
      multichain = new MetamaskMultichain({ logger: mockLogger });
    });

    it('should create session', async () => {
      const mockSessionData: SessionData = {
        sessionId: 'test-session',
        sessionScopes: {},
      };

      mockProvider.request.mockResolvedValue(mockSessionData);

      const result = await multichain.createSession({
        requiredScopes: { 'eip155:1': { methods: ['eth_accounts'] } }
      });

      expect(result).toEqual(mockSessionData);
      expect(mockProvider.request).toHaveBeenCalled();
    });

    it('should revoke session', async () => {
      const mockSessionData: SessionData = {
        sessionId: 'test-session',
        sessionScopes: {},
      };

      // Setup existing session
      await multichain.createSession({});
      mockProvider.request.mockResolvedValue(true);

      const result = await multichain.revokeSession({
        sessionId: mockSessionData.sessionId
      });

      expect(result).toBe(true);
    });

    it('should get session', async () => {
      const mockSessionData: SessionData = {
        sessionId: 'test-session',
        sessionScopes: {},
      };

      mockProvider.request.mockResolvedValue(mockSessionData);

      const result = await multichain.getSession({
        sessionId: 'test-session'
      });

      expect(result).toEqual(mockSessionData);
    });
  });

  describe('event handling', () => {
    it('should handle session changed events', () => {
      const listener = jest.fn();
      multichain = new MetamaskMultichain();

      multichain.addListener('sessionChanged', listener);

      // Simulate provider notification with proper session data
      const mockNotification = {
        method: 'wallet_sessionChanged',
        params: {
          sessionScopes: {},
          sessionId: 'test-session'
        },
      };

      // First ensure the session exists
      (multichain as any).sessions.set('SINGLE_SESSION_ONLY', {
        sessionId: 'test-session',
        sessionScopes: {}
      });

      // Then trigger notification
      mockProvider.onNotification.mock.calls[0][0](mockNotification);

      expect(listener).toHaveBeenCalledWith({
        type: 'updated',
        session: expect.any(Object)
      });
    });
  });
});
