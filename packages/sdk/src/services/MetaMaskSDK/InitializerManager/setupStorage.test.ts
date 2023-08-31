/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MetaMaskSDK } from '../../../sdk';
import { getStorageManager } from '../../../storage-manager/getStorageManager';
import { setupStorageManager } from './setupStorage';

jest.mock('../../../storage-manager/getStorageManager', () => {
  return {
    getStorageManager: jest.fn().mockReturnValue('MockedStorageManager'),
  };
});

describe('setupStorageManager', () => {
  let instance: MetaMaskSDK;

  const mockGetStorageManager = getStorageManager as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      options: {
        storage: {
          enabled: false,
          storageManager: null,
        },
      },
    } as unknown as MetaMaskSDK;
  });

  it('should not initialize storageManager if storage is disabled', async () => {
    await setupStorageManager(instance);

    expect(instance.options.storage?.storageManager).toBeNull();
    expect(mockGetStorageManager).not.toHaveBeenCalled();
  });

  it('should initialize storageManager if storage is enabled but storageManager is not set', async () => {
    instance.options.storage!.enabled = true;

    await setupStorageManager(instance);

    expect(instance.options.storage?.storageManager).toBe(
      'MockedStorageManager',
    );
    expect(mockGetStorageManager).toHaveBeenCalled();
  });

  it('should not re-initialize storageManager if storage is enabled and storageManager is already set', async () => {
    instance.options.storage!.enabled = true;
    const mockStorageManager = {
      ersistChannelConfig: jest.fn(),
      getPersistedChannelConfig: jest.fn(),
      terminate: jest.fn(),
    } as any;
    instance.options.storage!.storageManager = mockStorageManager;

    await setupStorageManager(instance);

    expect(instance.options.storage?.storageManager).toBe(mockStorageManager);
    expect(mockGetStorageManager).not.toHaveBeenCalled();
  });
});
