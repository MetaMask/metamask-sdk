import { MetaMaskSDK } from '../../../sdk';
import { performSDKInitialization } from './performSDKInitialization';
import { initializeMetaMaskSDK } from './initializeMetaMaskSDK';

jest.mock('./performSDKInitialization');

describe('initializeMetaMaskSDK', () => {
  let instance: MetaMaskSDK;
  const mockPerformSDKInitialization = performSDKInitialization as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformSDKInitialization.mockResolvedValue(undefined);

    instance = {
      _initialized: false,
      debug: false,
      sdkInitPromise: null,
    } as unknown as MetaMaskSDK;
  });

  describe('when the instance is not initialized', () => {
    it('should call performSDKInitialization', async () => {
      await initializeMetaMaskSDK(instance);
      expect(mockPerformSDKInitialization).toHaveBeenCalledWith(instance);
    });

    it('should set sdkInitPromise', async () => {
      await initializeMetaMaskSDK(instance);
      expect(instance.sdkInitPromise).not.toBeNull();
    });
  });

  describe('when the instance is already initialized', () => {
    beforeEach(() => {
      instance._initialized = true;
      instance.sdkInitPromise = Promise.resolve();
    });

    it('should not call performSDKInitialization', async () => {
      await initializeMetaMaskSDK(instance);
      expect(mockPerformSDKInitialization).not.toHaveBeenCalled();
    });
  });

  describe('when the instance is already initializing', () => {
    beforeEach(() => {
      instance.sdkInitPromise = Promise.resolve();
    });

    it('should not call performSDKInitialization', async () => {
      await initializeMetaMaskSDK(instance);
      expect(mockPerformSDKInitialization).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw an error if performSDKInitialization fails', async () => {
      mockPerformSDKInitialization.mockRejectedValue(
        new Error('Initialization error'),
      );

      await expect(initializeMetaMaskSDK(instance)).rejects.toThrow(
        'Initialization error',
      );
    });
  });
});
