import { Duplex } from 'stream';
import { SDKProvider } from '../provider/SDKProvider';
import { Ethereum } from './Ethereum';

jest.mock('../provider/SDKProvider');
jest.mock('@metamask/providers');

const mockSDKProvider = SDKProvider as jest.Mocked<typeof SDKProvider>;

describe('Ethereum Class', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init method', () => {
    it('should initialize a new Ethereum instance', () => {
      const stream = new Duplex();
      const props = {
        shouldSetOnWindow: false,
        connectionStream: stream,
        shouldSendMetadata: false,
        shouldShimWeb3: false,
        debug: false,
      };

      Ethereum.init(props);

      expect(mockSDKProvider).toHaveBeenCalledWith({
        connectionStream: stream,
        shouldSendMetadata: false,
        shouldSetOnWindow: false,
        shouldShimWeb3: false,
        autoRequestAccounts: false,
        debug: false,
      });
      expect(Ethereum.getInstance()).toBeDefined();
    });
  });

  describe('destroy method', () => {
    it('should destroy the Ethereum instance', () => {
      Ethereum.destroy();
      expect(() => Ethereum.getInstance()).toThrow(
        'Ethereum instance not intiialized - call Ethereum.factory first.',
      );
    });
  });

  describe('getProvider method', () => {
    it('should return the provider', () => {
      const stream = new Duplex();
      const props = {
        shouldSetOnWindow: false,
        connectionStream: stream,
        shouldSendMetadata: false,
        shouldShimWeb3: false,
        debug: false,
      };

      Ethereum.init(props);
      expect(Ethereum.getProvider()).toBeDefined();
    });

    it('should throw error if provider is not initialized', () => {
      Ethereum.destroy();
      expect(() => Ethereum.getProvider()).toThrow(
        'Ethereum instance not intiialized - call Ethereum.factory first.',
      );
    });
  });
});
