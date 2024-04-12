import { MetaMaskSDK } from '../../../sdk';
import * as loggerModule from '../../../utils/logger';
import { connect } from './connect';

jest.mock('../../../sdk');

describe('connect', () => {
  let instance: MetaMaskSDK;
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();
    instance = {
      _initialized: false,
      debug: false,
      init: jest.fn().mockResolvedValue(true),
      activeProvider: {
        request: jest.fn().mockResolvedValue('result'),
      },
    } as unknown as MetaMaskSDK;
  });

  describe('SDK Initialization', () => {
    it('should initialize MetaMaskSDK if not initialized', async () => {
      await connect(instance);
      expect(instance.init).toHaveBeenCalled();
    });

    it('should not initialize MetaMaskSDK if already initialized', async () => {
      instance._initialized = true;
      await connect(instance);
      expect(instance.init).not.toHaveBeenCalled();
    });
  });

  describe('Active Provider', () => {
    it('should call activeProvider.request with eth_requestAccounts', async () => {
      const result = await connect(instance);
      expect(instance.activeProvider?.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts',
        params: [],
      });
      expect(result).toBe('result');
    });

    it('should throw error if activeProvider is undefined', async () => {
      instance.activeProvider = undefined;
      await expect(connect(instance)).rejects.toThrow(
        'SDK state invalid -- undefined provider',
      );
    });
  });

  describe('Debug Mode', () => {
    it('should log debug messages when debug is true', async () => {
      await connect(instance);

      expect(spyLogger).toHaveBeenCalled();
    });
  });
});
