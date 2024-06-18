import { ChannelConfig } from '@metamask/sdk-communication-layer';
import {
  STORAGE_DAPP_CHAINID,
  STORAGE_DAPP_SELECTED_ADDRESS,
  STORAGE_PATH,
} from '../config';
import { StorageManagerWeb } from './StorageManagerWeb';

describe('StorageManagerWeb', () => {
  let storageManager: StorageManagerWeb;

  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    global.localStorage = mockLocalStorage as any;

    storageManager = new StorageManagerWeb();
  });

  describe('persistChannelConfig', () => {
    it('should store the channel config in localStorage', async () => {
      const channelConfig: ChannelConfig = {
        channelId: 'string',
        validUntil: 1234567890,
        lastActive: 1234567890,
      };

      await storageManager.persistChannelConfig(channelConfig);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_PATH,
        JSON.stringify(channelConfig),
      );
    });
  });

  describe('getPersistedChannelConfig', () => {
    it('should return the stored channel config if it exists', async () => {
      const channelConfig: ChannelConfig = {
        channelId: 'string',
        validUntil: 1234567890,
        lastActive: 1234567890,
      };
      mockLocalStorage.getItem.mockReturnValueOnce(
        JSON.stringify(channelConfig),
      );

      const result = await storageManager.getPersistedChannelConfig();
      expect(result).toStrictEqual(channelConfig);
    });

    it('should return undefined if no channel config exists in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      const result = await storageManager.getPersistedChannelConfig();
      expect(result).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Error reading localStorage');
      });

      const result = await storageManager.getPersistedChannelConfig();
      expect(result).toBeUndefined();
    });
  });

  describe('persistAccounts', () => {
    it('should store the accounts in localStorage', async () => {
      const accounts = ['0xABC'];

      await storageManager.persistAccounts(accounts);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_DAPP_SELECTED_ADDRESS,
        JSON.stringify(accounts),
      );
    });
  });

  describe('getCachedAccounts', () => {
    it('should return the stored accounts if they exist', async () => {
      const accounts = ['0xABC'];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(accounts));

      const result = await storageManager.getCachedAccounts();
      expect(result).toStrictEqual(accounts);
    });

    it('should return an empty array if no accounts exist in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      const result = await storageManager.getCachedAccounts();
      expect(result).toStrictEqual([]);
    });

    it('should handle errors when reading accounts', async () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Error reading localStorage');
      });

      await expect(storageManager.getCachedAccounts()).rejects.toThrow(
        'Error reading localStorage',
      );
    });
  });

  describe('persistChainId', () => {
    it('should store the chainId in localStorage', async () => {
      const chainId = '0x1';

      await storageManager.persistChainId(chainId);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_DAPP_CHAINID,
        chainId,
      );
    });
  });

  describe('getCachedChainId', () => {
    it('should return the stored chainId if it exists', async () => {
      const chainId = '0x1';
      mockLocalStorage.getItem.mockReturnValueOnce(chainId);

      const result = await storageManager.getCachedChainId();
      expect(result).toStrictEqual(chainId);
    });

    it('should return undefined if no chainId exists in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      const result = await storageManager.getCachedChainId();
      expect(result).toBeUndefined();
    });

    it('should handle errors when reading chainId', async () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Error reading localStorage');
      });

      await expect(storageManager.getCachedChainId()).rejects.toThrow(
        'Error reading localStorage',
      );
    });
  });

  describe('terminate', () => {
    it('should remove the stored channel config from localStorage', async () => {
      await storageManager.terminate();
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_PATH);
    });

    it('should remove the stored accounts from localStorage', async () => {
      await storageManager.terminate();
      expect(localStorage.removeItem).toHaveBeenCalledWith('.sdk-comm');
    });

    it('should remove the stored chainId from localStorage', async () => {
      await storageManager.terminate();
      expect(localStorage.removeItem).toHaveBeenCalledWith('.sdk-comm');
    });
  });
});
