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

  it('should call performSDKInitialization if the instance is not initialized', async () => {
    await initializeMetaMaskSDK(instance);

    expect(mockPerformSDKInitialization).toHaveBeenCalledWith(instance);
    expect(instance.sdkInitPromise).not.toBeNull();
  });

  it('should not call performSDKInitialization if the instance is already initialized', async () => {
    instance._initialized = true;
    instance.sdkInitPromise = Promise.resolve();

    await initializeMetaMaskSDK(instance);

    expect(mockPerformSDKInitialization).not.toHaveBeenCalled();
  });

  it('should not call performSDKInitialization if the instance is already initializing', async () => {
    instance.sdkInitPromise = Promise.resolve();

    await initializeMetaMaskSDK(instance);

    expect(mockPerformSDKInitialization).not.toHaveBeenCalled();
  });

  it('should throw an error if performSDKInitialization fails', async () => {
    mockPerformSDKInitialization.mockRejectedValue(
      new Error('Initialization error'),
    );

    await expect(initializeMetaMaskSDK(instance)).rejects.toThrow(
      'Initialization error',
    );
  });
});
