import { MetaMaskSDK } from '../../../sdk';
import { extractFavicon } from '../../../utils/extractFavicon';
import { setupDappMetadata } from './setupDappMetadata';

jest.mock('../../../utils/extractFavicon', () => ({
  extractFavicon: jest.fn(),
}));

describe('setupDappMetadata', () => {
  let instance: MetaMaskSDK;
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

  const mockExtractFavicon = extractFavicon as jest.MockedFunction<
    typeof extractFavicon
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    mockExtractFavicon.mockReturnValue('favicon');

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

  it('should set iconUrl to favicon if it does not start with http:// or https://', () => {
    instance.options.dappMetadata = {
      iconUrl: 'ftp://example.com/favicon.ico',
      url: 'https://example.com',
    };

    setupDappMetadata(instance);

    expect(instance.dappMetadata?.iconUrl).toBe('favicon');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid dappMetadata.iconUrl: URL must start with http:// or https://',
    );
  });

  it('should set iconUrl to undenied if it does not start with http:// or https:// and favicon is undefined', () => {
    instance.options.dappMetadata = {
      iconUrl: 'ftp://example.com/favicon.ico',
      url: 'https://example.com',
    };

    mockExtractFavicon.mockReturnValue(undefined);

    setupDappMetadata(instance);

    expect(instance.dappMetadata?.iconUrl).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid dappMetadata.iconUrl: URL must start with http:// or https://',
    );
  });

  it('should set base64Icon to undefined if its length exceeds 163400 characters', () => {
    const longString = new Array(163401).fill('a').join('');
    instance.options.dappMetadata = {
      iconUrl: 'https://example.com/favicon.ico',
      url: 'https://example.com',
      base64Icon: longString,
    };

    setupDappMetadata(instance);

    expect(instance.dappMetadata?.base64Icon).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid dappMetadata.base64Icon: Base64-encoded icon string length must be less than 163400 characters',
    );
  });

  it('should set iconUrl to the extracted favicon if iconUrl and base64Icon are not provided', () => {
    instance.options.dappMetadata = {
      url: 'https://example.com',
    };

    setupDappMetadata(instance);

    expect(instance.dappMetadata?.iconUrl).toBe('favicon');
  });

  it('should not throw an error if dappMetadata is not provided', () => {
    instance.options.dappMetadata =
      undefined as unknown as MetaMaskSDK['options']['dappMetadata'];

    expect(() => setupDappMetadata(instance)).not.toThrow();
  });
});
