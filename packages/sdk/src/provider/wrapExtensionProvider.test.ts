import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS } from '../config';
import * as loggerModule from '../utils/logger';
import { MetaMaskSDK } from '../sdk';
import { wrapExtensionProvider } from './wrapExtensionProvider';

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

describe('wrapExtensionProvider', () => {
  let sdkInstance: MetaMaskSDK;
  let mockExtensionProvider: MetaMaskInpageProvider;
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    sdkInstance = {
      options: {
        dappMetadata: {},
      },
      platformManager: {
        getPlatformType: jest.fn(),
      },
    } as unknown as MetaMaskSDK;

    mockExtensionProvider = {
      request: jest.fn(),
    } as unknown as MetaMaskInpageProvider;
  });

  it('initializes Proxy around SDKProvider', () => {
    const provider = mockExtensionProvider;
    const wrapped = wrapExtensionProvider({ provider, sdkInstance });
    expect(typeof wrapped).toBe('object');
  });

  it('calls the original request method', async () => {
    const provider = mockExtensionProvider;
    const wrapped = wrapExtensionProvider({ provider, sdkInstance });
    const mockRequest = jest.fn();
    provider.request = mockRequest;

    await wrapped.request({ method: 'someMethod', params: ['param1'] });
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'someMethod',
      params: ['param1'],
    });
  });

  it('logs debug information if debug flag is enabled', async () => {
    const provider = mockExtensionProvider;
    const wrapped = wrapExtensionProvider({ provider, sdkInstance });

    await wrapped.request({ method: 'someMethod' });

    expect(spyLogger).toHaveBeenCalledWith(
      `[wrapExtensionProvider()] Overwriting request method`,
      { method: 'someMethod' },
    );
  });

  it('handles special method correctly', async () => {
    const provider = mockExtensionProvider;
    const wrapped = wrapExtensionProvider({ provider, sdkInstance });
    const mockRequest = jest.fn().mockResolvedValue(['response', 'response']);
    provider.request = mockRequest;

    const responses = await wrapped.request({
      method: RPC_METHODS.METAMASK_BATCH,
      params: [
        { method: 'rpc1', params: [] },
        { method: 'rpc2', params: [] },
      ],
    });
    expect(responses).toStrictEqual(['response', 'response']);
  });
});
