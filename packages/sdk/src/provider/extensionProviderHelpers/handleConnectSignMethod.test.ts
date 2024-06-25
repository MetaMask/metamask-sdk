import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS } from '../../config';
import { handleConnectSignMethod } from './handleConnectSignMethod';

jest.mock('@metamask/providers', () => {
  return {
    MetaMaskInpageProvider: jest.fn(() => {
      return {
        // Mock implementation here
        request: jest.fn(),
      };
    }),
  };
});

describe('handleConnectSignMethod', () => {
  let mockTarget: MetaMaskInpageProvider;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTarget = {
      request: jest.fn(),
    } as unknown as MetaMaskInpageProvider;
  });

  it('should requests ETH accounts and calls personal_sign with the first account', async () => {
    const accounts = ['0x1234567890abcdef'];
    (mockTarget.request as jest.Mock)
      .mockResolvedValueOnce(accounts) // For ETH_REQUESTACCOUNTS
      .mockResolvedValueOnce('signedMessage'); // For PERSONAL_SIGN

    const params = ['message'];
    const response = await handleConnectSignMethod({
      target: mockTarget,
      params,
    });

    expect(mockTarget.request).toHaveBeenCalledWith({
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      params: [],
    });

    expect(mockTarget.request).toHaveBeenCalledWith({
      method: RPC_METHODS.PERSONAL_SIGN,
      params: ['message', '0x1234567890abcdef'],
    });

    expect(response).toBe('signedMessage');
  });

  it('should throws an error if no accounts are returned', async () => {
    (mockTarget.request as jest.Mock).mockResolvedValueOnce([]); // For ETH_REQUESTACCOUNTS

    const params = ['message'];
    await expect(
      handleConnectSignMethod({
        target: mockTarget,
        params,
      }),
    ).rejects.toThrow('SDK state invalid -- undefined accounts');
  });

  it('should throws an error if the accounts array is undefined', async () => {
    (mockTarget.request as jest.Mock).mockResolvedValueOnce([]); // For ETH_REQUESTACCOUNTS

    const params = ['message'];
    await expect(
      handleConnectSignMethod({
        target: mockTarget,
        params,
      }),
    ).rejects.toThrow('SDK state invalid -- undefined accounts');
  });
});
