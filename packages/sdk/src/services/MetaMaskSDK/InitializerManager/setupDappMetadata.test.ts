import { MetaMaskSDK } from '../../../sdk';
import { extractFavicon } from '../../../utils/extractFavicon';
import { getBase64FromUrl } from '../../../utils/getBase64FromUrl';
import { setupDappMetadata } from './setupDappMetadata';

jest.mock('../../../utils/extractFavicon');
jest.mock('../../../utils/getBase64FromUrl');

describe('setupDappMetadata', () => {
  let instance: MetaMaskSDK;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      platformManager: {
        isBrowser: jest.fn().mockReturnValue(true),
      },
      options: {
        dappMetadata: {},
      },
    } as unknown as MetaMaskSDK;
  });

  it('should call extractFavicon if conditions are met', async () => {
    await setupDappMetadata(instance);
    expect(extractFavicon).toHaveBeenCalled();
  });

  it('should set base64Icon if favicon is extracted', async () => {
    (extractFavicon as jest.Mock).mockReturnValue(
      'http://favicon.com/icon.png',
    );
    (getBase64FromUrl as jest.Mock).mockResolvedValue('base64data');

    await setupDappMetadata(instance);

    expect(instance.options.dappMetadata.base64Icon).toBe('base64data');
  });

  it('should handle errors gracefully', async () => {
    (extractFavicon as jest.Mock).mockReturnValue(
      'http://favicon.com/icon.png',
    );
    (getBase64FromUrl as jest.Mock).mockRejectedValue(new Error('Failed'));

    await setupDappMetadata(instance);

    expect(instance.options.dappMetadata.base64Icon).toBeUndefined();
  });
});
