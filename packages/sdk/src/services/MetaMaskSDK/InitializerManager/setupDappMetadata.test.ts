import { MetaMaskSDK } from '../../../sdk';
import { setupDappMetadata } from './setupDappMetadata';

describe('setupDappMetadata', () => {
  let instance: MetaMaskSDK;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      options: {
        dappMetadata: {},
      },
    } as unknown as MetaMaskSDK;
  });

  it('should attach dappMetadata to the instance if valid', async () => {
    instance.options.dappMetadata = {
      iconUrl: 'https://example.com/favicon.ico',
      url: 'https://example.com',
    };

    setupDappMetadata(instance);

    expect(instance.dappMetadata).toStrictEqual(instance.options.dappMetadata);
  });

  it('should throw error if iconUrl does not start with http:// or https://', async () => {
    instance.options.dappMetadata = {
      iconUrl: 'ftp://example.com/favicon.ico',
      url: 'https://example.com',
    };

    expect(() => setupDappMetadata(instance)).toThrow(
      'Invalid dappMetadata.iconUrl: URL must start with http:// or https://',
    );
  });

  it('should throw error if url does not start with http:// or https://', async () => {
    instance.options.dappMetadata = {
      iconUrl: 'https://example.com/favicon.ico',
      url: 'ftp://example.com',
    };

    expect(() => setupDappMetadata(instance)).toThrow(
      'Invalid dappMetadata.url: URL must start with http:// or https://',
    );
  });

  it('should not throw an error if dappMetadata is not provided', async () => {
    instance.options.dappMetadata =
      undefined as unknown as MetaMaskSDK['options']['dappMetadata'];

    expect(setupDappMetadata(instance)).toBeUndefined();
  });
});
