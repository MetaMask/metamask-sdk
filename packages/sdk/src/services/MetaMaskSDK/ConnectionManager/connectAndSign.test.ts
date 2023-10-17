import { MetaMaskSDK } from '../../../sdk';
import { connectAndSign } from './connectAndSign';

jest.mock('../../../sdk');

describe('connectAndSign', () => {
  let instance: MetaMaskSDK;

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
      await connectAndSign({ instance, msg: 'test' });
      expect(instance.init).toHaveBeenCalled();
    });

    it('should not initialize MetaMaskSDK if already initialized', async () => {
      instance._initialized = true;
      await connectAndSign({ instance, msg: 'test' });
      expect(instance.init).not.toHaveBeenCalled();
    });
  });
});
