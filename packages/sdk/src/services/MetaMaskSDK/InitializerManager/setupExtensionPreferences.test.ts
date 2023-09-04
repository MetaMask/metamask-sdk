import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../../sdk';
import { getBrowserExtension } from '../../../utils/get-browser-extension';
import { setupExtensionPreferences } from './setupExtensionPreferences';

jest.mock('../../../utils/get-browser-extension');

describe('setupExtensionPreferences', () => {
  let instance: MetaMaskSDK;
  const mockIsMetaMaskMobileWebView = jest.fn();

  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };

  let mockEthereum = {};

  beforeEach(() => {
    jest.clearAllMocks();

    mockEthereum = {};

    global.window = {
      ethereum: mockEthereum,
    } as any;

    global.localStorage = localStorageMock as any;

    instance = {
      platformManager: {
        isMetaMaskMobileWebView: mockIsMetaMaskMobileWebView,
      },
      options: {
        logging: {},
        extensionOnly: false,
      },
      analytics: {
        send: jest.fn(),
      },
    } as unknown as MetaMaskSDK;

    mockIsMetaMaskMobileWebView.mockReturnValue(false);

    localStorageMock.removeItem.mockReturnValue(undefined);
  });

  it('should set preferExtension based on localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('extension');
    const { preferExtension } = await setupExtensionPreferences(instance);
    expect(preferExtension).toBe(true);
  });

  it('should set metamaskBrowserExtension when present', async () => {
    (getBrowserExtension as jest.Mock).mockReturnValue({});

    const { metamaskBrowserExtension } = await setupExtensionPreferences(
      instance,
    );
    expect(metamaskBrowserExtension).toBeDefined();
  });

  it('should return early for in-app browsers', async () => {
    mockIsMetaMaskMobileWebView.mockReturnValue(true);

    const { shouldReturn } = await setupExtensionPreferences(instance);
    expect(shouldReturn).toBe(true);
    expect(instance.analytics?.send).toHaveBeenCalledWith({
      event: TrackingEvents.SDK_USE_INAPP_BROWSER,
    });
  });

  it('should return early when extensionOnly is true and extension is present', async () => {
    instance.options.extensionOnly = true;
    (getBrowserExtension as jest.Mock).mockReturnValue({});

    const { shouldReturn } = await setupExtensionPreferences(instance);
    expect(shouldReturn).toBe(true);
    expect(instance.analytics?.send).toHaveBeenCalledWith({
      event: TrackingEvents.SDK_USE_EXTENSION,
    });
  });
});
