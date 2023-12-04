import { MetaMaskSDK } from '../../../sdk';
import { extractFavicon } from '../../../utils/extractFavicon';
import { getBase64FromUrl } from '../../../utils/getBase64FromUrl';
import { setupDappMetadata } from './setupDappMetadata';

jest.mock('../../../utils/extractFavicon', () => ({
  extractFavicon: jest.fn(),
}));

jest.mock('../../../utils/getBase64FromUrl', () => ({
  getBase64FromUrl: jest.fn(),
}));

describe('setupDappMetadata', () => {
  let instance: MetaMaskSDK;
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

  const mockExtractFavicon = extractFavicon as jest.MockedFunction<
    typeof extractFavicon
  >;

  const mockGetBase64FromUrl = getBase64FromUrl as jest.MockedFunction<
    typeof getBase64FromUrl
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    mockExtractFavicon.mockReturnValue('favicon');
    mockGetBase64FromUrl.mockResolvedValue('faviconBase64Icon');

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

    await setupDappMetadata(instance);

    expect(instance.dappMetadata).toStrictEqual(instance.options.dappMetadata);
  });

  it('should set iconUrl to undenied if it does not start with http:// or https:// and favicon is undefined', async () => {
    instance.options.dappMetadata = {
      iconUrl: 'ftp://example.com/favicon.ico',
      url: 'https://example.com',
    };

    mockExtractFavicon.mockReturnValue(undefined);

    await setupDappMetadata(instance);

    expect(instance.dappMetadata?.iconUrl).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid dappMetadata.iconUrl: URL must start with http:// or https://',
    );
  });

  it('should set base64Icon to undefined if its length exceeds 163400 characters', async () => {
    const longString = new Array(163401).fill('a').join('');
    instance.options.dappMetadata = {
      iconUrl: 'https://example.com/favicon.ico',
      url: 'https://example.com',
      base64Icon: longString,
    };

    await setupDappMetadata(instance);

    expect(instance.dappMetadata?.base64Icon).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid dappMetadata.base64Icon: Base64-encoded icon string length must be less than 163400 characters',
    );
  });

  it('should set iconUrl to the extracted favicon if iconUrl and base64Icon are not provided', async () => {
    instance.options.dappMetadata = {
      url: 'https://example.com',
    };

    global.window = {
      location: {
        protocol: 'https:',
        host: 'example.com/',
      },
    } as any;

    await setupDappMetadata(instance);

    expect(instance.dappMetadata?.iconUrl).toBe('https://example.com/favicon');
  });

  it('should not throw an error if dappMetadata is not provided', () => {
    instance.options.dappMetadata =
      undefined as unknown as MetaMaskSDK['options']['dappMetadata'];

    expect(() => setupDappMetadata(instance)).not.toThrow();
  });
});
