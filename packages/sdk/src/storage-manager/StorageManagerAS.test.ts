import { ChannelConfig } from '@metamask/sdk-communication-layer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_PATH } from '../config';
import { StorageManagerAS } from './StorageManagerAS';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('StorageManagerAS', () => {
  let storageManager: StorageManagerAS;

  beforeEach(() => {
    storageManager = new StorageManagerAS();
    jest.clearAllMocks();
  });

  describe('persistChannelConfig', () => {
    it('should store the channel config', async () => {
      const channelConfig: ChannelConfig = {
        channelId: 'string',
        validUntil: 1234567890,
        lastActive: 1234567890,
      };

      await storageManager.persistChannelConfig(channelConfig);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
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
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(channelConfig),
      );

      const result = await storageManager.getPersistedChannelConfig();
      expect(result).toStrictEqual(channelConfig);
    });

    it('should return undefined if no channel config exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const result = await storageManager.getPersistedChannelConfig();
      expect(result).toBeUndefined();
    });
  });

  describe('terminate', () => {
    it('should remove the stored channel config', async () => {
      await storageManager.terminate();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_PATH);
    });
  });
});
