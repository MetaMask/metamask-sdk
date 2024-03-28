import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS } from '../config'; // Adjust the import path as necessary
import { MetaMaskSDK } from '../sdk'; // Adjust the import path as necessary
import { logger } from '../utils/logger'; // Adjust the import path as necessary
import { extensionConnectWithOverwrite } from './extensionConnectWithOverwrite'; // Adjust the import path as necessary

jest.mock('../sdk');
jest.mock('../utils/logger');

jest.mock('@metamask/providers', () => ({
  MetaMaskInpageProvider: jest.fn().mockImplementation(() => ({
    request: jest.fn(), // This should set up the mock so it's recognized as a Jest mock function
  })),
}));

describe('extensionConnectWithOverwrite', () => {
  let sdkInstance: MetaMaskSDK;
  let mockExtensionProvider: MetaMaskInpageProvider;
  const mockAccounts = ['0x123'];

  beforeEach(() => {
    jest.clearAllMocks();

    mockExtensionProvider = {
      request: jest.fn().mockReturnValue(mockAccounts),
    } as unknown as jest.Mocked<MetaMaskInpageProvider>;

    sdkInstance = {
      options: {
        dappMetadata: {},
      },
      isExtensionActive: jest.fn(),
      getProvider: jest.fn().mockReturnValue(mockExtensionProvider),
      platformManager: {
        getPlatformType: jest.fn(),
      },
    } as unknown as MetaMaskSDK;
  });

  it('should throw error if SDK extension is not active', async () => {
    await expect(
      extensionConnectWithOverwrite({
        method: RPC_METHODS.ETH_REQUESTACCOUNTS,
        sdk: sdkInstance,
        params: [],
      }),
    ).rejects.toThrow('SDK state invalid -- extension is not active');
  });

  it('should log and call ETH_REQUESTACCOUNTS method', async () => {
    // mock isExtensionActive to return true
    jest
      .spyOn(sdkInstance, 'isExtensionActive')
      .mockImplementation()
      .mockReturnValue(true);

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
    expect(result).toStrictEqual(mockAccounts);
  });
  // Add more tests for different methods and scenarios
});
