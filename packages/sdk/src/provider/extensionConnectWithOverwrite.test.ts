import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS, rpcWithAccountParam } from '../config';
import { MetaMaskSDK } from '../sdk';
import { logger } from '../utils/logger';
import { extensionConnectWithOverwrite } from './extensionConnectWithOverwrite';

jest.mock('../sdk');
jest.mock('../utils/logger');

jest.mock('@metamask/providers', () => ({
  MetaMaskInpageProvider: jest.fn().mockImplementation(() => ({
    request: jest.fn(),
  })),
}));

describe('extensionConnectWithOverwrite', () => {
  let sdkInstance: MetaMaskSDK;
  let mockExtensionProvider: jest.Mocked<MetaMaskInpageProvider>;
  const mockAccounts = ['0x123'];

  beforeEach(() => {
    jest.clearAllMocks();

    mockExtensionProvider = {
      request: jest.fn().mockResolvedValue(mockAccounts),
    } as unknown as jest.Mocked<MetaMaskInpageProvider>;

    sdkInstance = {
      isExtensionActive: jest.fn(),
      getProvider: jest.fn().mockReturnValue(mockExtensionProvider),
    } as unknown as MetaMaskSDK;
  });

  it('should throw error if SDK extension is not active', async () => {
    (sdkInstance.isExtensionActive as jest.Mock).mockReturnValue(false);

    await expect(
      extensionConnectWithOverwrite({
        method: RPC_METHODS.ETH_REQUESTACCOUNTS,
        sdk: sdkInstance,
        params: [],
      }),
    ).rejects.toThrow('SDK state invalid -- extension is not active');
  });

  it('should log and call ETH_REQUESTACCOUNTS method', async () => {
    (sdkInstance.isExtensionActive as jest.Mock).mockReturnValue(true);

    const result = await extensionConnectWithOverwrite({
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      sdk: sdkInstance,
      params: [],
    });

    expect(logger).toHaveBeenCalledWith(
      `[MetaMaskProvider: extensionConnectWithOverwrite()] Overwriting request method`,
      RPC_METHODS.ETH_REQUESTACCOUNTS,
      [],
    );

    expect(mockExtensionProvider.request).toHaveBeenCalledWith({
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      params: [],
    });
    expect(result).toStrictEqual(mockAccounts);
  });

  it('should throw error if no accounts are returned', async () => {
    (sdkInstance.isExtensionActive as jest.Mock).mockReturnValue(true);
    mockExtensionProvider.request.mockResolvedValueOnce([]);

    await expect(
      extensionConnectWithOverwrite({
        method: RPC_METHODS.PERSONAL_SIGN,
        sdk: sdkInstance,
        params: ['test message'],
      }),
    ).rejects.toThrow('SDK state invalid -- undefined accounts');
  });

  it('should handle PERSONAL_SIGN method', async () => {
    (sdkInstance.isExtensionActive as jest.Mock).mockReturnValue(true);
    mockExtensionProvider.request.mockResolvedValueOnce(mockAccounts);
    const personalSignParams = ['test message'];
    const expectedResponse = 'signed_message';
    mockExtensionProvider.request.mockResolvedValueOnce(expectedResponse);

    const result = await extensionConnectWithOverwrite({
      method: RPC_METHODS.PERSONAL_SIGN,
      sdk: sdkInstance,
      params: personalSignParams,
    });

    expect(mockExtensionProvider.request).toHaveBeenCalledWith({
      method: RPC_METHODS.PERSONAL_SIGN,
      params: [personalSignParams[0], mockAccounts[0]],
    });
    expect(result).toBe(expectedResponse);
  });

  it('should handle ETH_SENDTRANSACTION method', async () => {
    (sdkInstance.isExtensionActive as jest.Mock).mockReturnValue(true);
    mockExtensionProvider.request.mockResolvedValueOnce(mockAccounts);
    const ethSendTransactionParams = [{ to: '0x456' }];
    const expectedResponse = 'transaction_hash';
    mockExtensionProvider.request.mockResolvedValueOnce(expectedResponse);

    const result = await extensionConnectWithOverwrite({
      method: RPC_METHODS.ETH_SENDTRANSACTION,
      sdk: sdkInstance,
      params: ethSendTransactionParams,
    });

    expect(mockExtensionProvider.request).toHaveBeenCalledWith({
      method: RPC_METHODS.ETH_SENDTRANSACTION,
      params: [{ ...ethSendTransactionParams[0], from: mockAccounts[0] }],
    });
    expect(result).toBe(expectedResponse);
  });

  it('should handle methods in rpcWithAccountParam', async () => {
    const testMethod = rpcWithAccountParam[0];
    (sdkInstance.isExtensionActive as jest.Mock).mockReturnValue(true);
    mockExtensionProvider.request.mockResolvedValueOnce(mockAccounts);

    const result = await extensionConnectWithOverwrite({
      method: testMethod,
      sdk: sdkInstance,
      params: [],
    });

    expect(result).toBe(mockAccounts);
  });

  it('should handle other methods', async () => {
    (sdkInstance.isExtensionActive as jest.Mock).mockReturnValue(true);
    mockExtensionProvider.request.mockResolvedValueOnce(mockAccounts);
    const otherMethod = 'eth_otherMethod';
    const otherMethodParams = ['param1', 'param2'];
    const expectedResponse = 'other_method_response';
    mockExtensionProvider.request.mockResolvedValueOnce(expectedResponse);

    const result = await extensionConnectWithOverwrite({
      method: otherMethod,
      sdk: sdkInstance,
      params: otherMethodParams,
    });

    expect(mockExtensionProvider.request).toHaveBeenCalledWith({
      method: otherMethod,
      params: otherMethodParams,
    });
    expect(result).toBe(expectedResponse);
  });
});
