import { Duplex } from 'readable-stream';
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
      };

      Ethereum.init(props as any);

      expect(mockSDKProvider).toHaveBeenCalledWith({
        connectionStream: stream,
        shouldSendMetadata: false,
        shouldSetOnWindow: false,
        shouldShimWeb3: false,
        autoRequestAccounts: false,
      });
      expect(Ethereum.getInstance()).toBeDefined();
    });
  });

  describe('destroy method', () => {
    it('should not tdestroy the ethereum instance', () => {
      Ethereum.destroy();
      expect(() => Ethereum.getInstance()).not.toThrow();
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

      Ethereum.init(props as any);
      expect(Ethereum.getProvider()).toBeDefined();
    });

    it('should throw error if provider is not initialized', () => {
      // Force reset the Ethereum instance
      jest.spyOn(Ethereum, 'getInstance').mockImplementation(() => {
        throw new Error(
          'Ethereum instance not intiialized - call Ethereum.factory first.',
        );
      });

      expect(() => Ethereum.getProvider()).toThrow(
        'Ethereum instance not intiialized - call Ethereum.factory first.',
      );

      // Restore the original implementation after the test
      jest.restoreAllMocks();
    });
  });
});
