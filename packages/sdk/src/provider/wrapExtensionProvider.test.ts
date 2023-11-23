import { Duplex } from 'stream';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS } from '../config';
import { wrapExtensionProvider } from './wrapExtensionProvider';

jest.mock('stream', () => ({
  Duplex: class MockDuplex {
    write() {
      // Intentionally empty for testing
    }

    read() {
      // Intentionally empty for testing
    }
  },
}));

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

function createMockExtensionProvider(): MetaMaskInpageProvider {
  const defaultConnectionStream = new Duplex();

  return new MetaMaskInpageProvider(defaultConnectionStream);
}

describe('wrapExtensionProvider', () => {
  it('initializes Proxy around SDKProvider', () => {
    const provider = createMockExtensionProvider();
    const wrapped = wrapExtensionProvider({ provider });
    expect(typeof wrapped).toBe('object');
  });

  it('calls the original request method', async () => {
    const provider = createMockExtensionProvider();
    const wrapped = wrapExtensionProvider({ provider });
    const mockRequest = jest.fn();
    provider.request = mockRequest;

    await wrapped.request({ method: 'someMethod', params: ['param1'] });
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'someMethod',
      params: ['param1'],
    });
  });

  it('logs debug information if debug flag is enabled', async () => {
    const consoleSpy = jest.spyOn(console, 'debug');
    const provider = createMockExtensionProvider();
    const wrapped = wrapExtensionProvider({ provider, debug: true });

    await wrapped.request({ method: 'someMethod' });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('handles special method correctly', async () => {
    const provider = createMockExtensionProvider();
    const wrapped = wrapExtensionProvider({ provider });
    const mockRequest = jest.fn().mockResolvedValue('response');
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
