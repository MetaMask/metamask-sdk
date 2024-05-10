import { ChannelConfig } from '@metamask/sdk-communication-layer';
import { STORAGE_PATH } from '../config'; // Update the import to match the correct location
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
  });

  describe('terminate', () => {
    it('should remove the stored channel config from localStorage', async () => {
      await storageManager.terminate();
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_PATH);
    });
  });
});
