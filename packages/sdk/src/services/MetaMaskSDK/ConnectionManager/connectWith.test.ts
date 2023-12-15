import { MetaMaskSDK } from '../../../sdk';
import { connectWith } from './connectWith';

jest.mock('../../../sdk');

const mockRpc = {
  method: 'personal_sign',
  params: [],
};

describe('connectWith', () => {
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
      await connectWith({ instance, rpc: mockRpc });
      expect(instance.init).toHaveBeenCalled();
    });

    it('should not initialize MetaMaskSDK if already initialized', async () => {
      instance._initialized = true;
      await connectWith({ instance, rpc: mockRpc });
      expect(instance.init).not.toHaveBeenCalled();
    });
  });
});
