import * as fs from 'fs';
import { ChannelConfig } from '@metamask/sdk-communication-layer';
import {
  STORAGE_DAPP_CHAINID,
  STORAGE_DAPP_SELECTED_ADDRESS,
  STORAGE_PATH,
} from '../config';
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

  describe('persistAccounts', () => {
    it('should write the accounts to file', async () => {
      const accounts = ['0xABC'];

      await storageManager.persistAccounts(accounts);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        STORAGE_DAPP_SELECTED_ADDRESS,
        JSON.stringify(accounts),
      );
    });
  });

  describe('getCachedAccounts', () => {
    it('should return the stored accounts if they exist', async () => {
      const accounts = ['0xABC'];

      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(
        JSON.stringify(accounts),
      );

      const result = await storageManager.getCachedAccounts();
      expect(result).toStrictEqual(accounts);
    });

    it('should return an empty array if no accounts exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

      const result = await storageManager.getCachedAccounts();
      expect(result).toStrictEqual([]);
    });

    it('should handle errors when reading accounts', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Error reading file');
      });

      await expect(storageManager.getCachedAccounts()).rejects.toThrow(
        'Error reading file',
      );
    });
  });

  describe('persistChainId', () => {
    it('should write the chainId to file', async () => {
      const chainId = '0x1';

      await storageManager.persistChainId(chainId);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        STORAGE_DAPP_CHAINID,
        chainId,
      );
    });
  });

  describe('getCachedChainId', () => {
    it('should return the stored chainId if it exists', async () => {
      const chainId = '0x1';

      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(chainId);

      const result = await storageManager.getCachedChainId();
      expect(result).toStrictEqual(chainId);
    });

    it('should return undefined if no chainId exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

      const result = await storageManager.getCachedChainId();
      expect(result).toBeUndefined();
    });

    it('should return undefined if chainId is invalid', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (fs.readFileSync as jest.Mock).mockReturnValueOnce('invalidChainId');

      const result = await storageManager.getCachedChainId();
      expect(result).toBeUndefined();
    });

    it('should handle errors when reading chainId', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Error reading file');
      });

      await expect(storageManager.getCachedChainId()).rejects.toThrow(
        'Error reading file',
      );
    });
  });

  describe('terminate', () => {
    it('should remove the stored channel config if it exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);

      await storageManager.terminate();
      expect(fs.unlinkSync).toHaveBeenCalledWith(STORAGE_PATH);
    });

    it('should remove the stored accounts if they exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);

      await storageManager.terminate();
      expect(fs.unlinkSync).toHaveBeenCalledWith('.sdk-comm');
    });

    it('should remove the stored chainId if it exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);

      await storageManager.terminate();
      expect(fs.unlinkSync).toHaveBeenCalledWith('.sdk-comm');
    });

    it('should not attempt to remove files if they do not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await storageManager.terminate();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});
