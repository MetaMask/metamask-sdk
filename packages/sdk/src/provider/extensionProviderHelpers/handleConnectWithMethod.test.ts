import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS, rpcWithAccountParam } from '../../config';
import { handleConnectWithMethod } from './handleConnectWithMethod';

jest.mock('@metamask/providers', () => {
  return {
    MetaMaskInpageProvider: jest.fn(() => {
      return {
        request: jest.fn(),
      };
    }),
  };
});

describe('handleConnectWithMethod', () => {
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

    const params = [{ method: RPC_METHODS.PERSONAL_SIGN, params: ['message'] }];
    const response = await handleConnectWithMethod({
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

  it('should requests ETH accounts and calls eth_sendTransaction with the first account', async () => {
    const accounts = ['0x1234567890abcdef'];
    (mockTarget.request as jest.Mock)
      .mockResolvedValueOnce(accounts) // For ETH_REQUESTACCOUNTS
      .mockResolvedValueOnce('transactionHash'); // For ETH_SENDTRANSACTION

    const params = [
      { method: RPC_METHODS.ETH_SENDTRANSACTION, params: [{ to: '0xabcd' }] },
    ];
    const response = await handleConnectWithMethod({
      target: mockTarget,
      params,
    });

    expect(mockTarget.request).toHaveBeenCalledWith({
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      params: [],
    });

    expect(mockTarget.request).toHaveBeenCalledWith({
      method: RPC_METHODS.ETH_SENDTRANSACTION,
      params: [{ to: '0xabcd', from: '0x1234567890abcdef' }],
    });

    expect(response).toBe('transactionHash');
  });

  it('should returns accounts if the method is in rpcWithAccountParam', async () => {
    const accounts = ['0x1234567890abcdef'];
    (mockTarget.request as jest.Mock).mockResolvedValueOnce(accounts); // For ETH_REQUESTACCOUNTS

    const params = [{ method: 'someOtherMethod', params: ['param1'] }];
    rpcWithAccountParam.push('someothermethod'); // Adding method to mock the list

    const response = await handleConnectWithMethod({
      target: mockTarget,
      params,
    });

    expect(response).toBe(accounts);
  });

  it('should calls the rpc method directly if it is not in rpcWithAccountParam and does not require accounts', async () => {
    const accounts = ['0x1234567890abcdef'];
    (mockTarget.request as jest.Mock).mockResolvedValueOnce(accounts); // For ETH_REQUESTACCOUNTS
    (mockTarget.request as jest.Mock).mockResolvedValueOnce('rpcResponse'); // For other RPC methods

    const params = [{ method: 'someRpcMethod', params: ['param1'] }];

    const response = await handleConnectWithMethod({
      target: mockTarget,
      params,
    });

    expect(mockTarget.request).toHaveBeenCalledWith({
      method: 'someRpcMethod',
      params: ['param1'],
    });

    expect(response).toBe('rpcResponse');
  });

  it('should throws an error if no accounts are returned', async () => {
    (mockTarget.request as jest.Mock).mockResolvedValueOnce([]); // For ETH_REQUESTACCOUNTS

    const params = [{ method: RPC_METHODS.PERSONAL_SIGN, params: ['message'] }];

    await expect(
      handleConnectWithMethod({
        target: mockTarget,
        params,
      }),
    ).rejects.toThrow('SDK state invalid -- undefined accounts');
  });

  it('should throws an error if the accounts array is undefined', async () => {
    (mockTarget.request as jest.Mock).mockResolvedValueOnce([]); // For ETH_REQUESTACCOUNTS

    const params = [{ method: RPC_METHODS.PERSONAL_SIGN, params: ['message'] }];

    await expect(
      handleConnectWithMethod({
        target: mockTarget,
        params,
      }),
    ).rejects.toThrow('SDK state invalid -- undefined accounts');
  });
});
