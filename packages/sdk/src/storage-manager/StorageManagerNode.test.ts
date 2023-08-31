import * as fs from 'fs';
import { ChannelConfig } from '@metamask/sdk-communication-layer';
import { STORAGE_PATH } from '../config';
import { StorageManagerNode } from './StorageManagerNode';

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('StorageManagerNode', () => {
  let storageManager: StorageManagerNode;

  beforeEach(() => {
    storageManager = new StorageManagerNode();
    jest.clearAllMocks();
  });

  describe('persistChannelConfig', () => {
    it('should write the channel config to file', async () => {
      const channelConfig: ChannelConfig = {
        channelId: 'string',
        validUntil: 1234567890,
        lastActive: 1234567890,
      };

      await storageManager.persistChannelConfig(channelConfig);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
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

      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(
        JSON.stringify(channelConfig),
      );

      const result = await storageManager.getPersistedChannelConfig();
      expect(result).toStrictEqual(channelConfig);
    });

    it('should return undefined if no channel config exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

      const result = await storageManager.getPersistedChannelConfig();
      expect(result).toBeUndefined();
    });
  });

  describe('terminate', () => {
    it('should remove the stored channel config if it exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);

      await storageManager.terminate();
      expect(fs.unlinkSync).toHaveBeenCalledWith(STORAGE_PATH);
    });

    it('should not attempt to remove the stored channel config if it does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

      await storageManager.terminate();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});
