import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../../sdk';
import { SDKProvider } from '../../../provider/SDKProvider';
import { getBrowserExtension } from '../../../utils/get-browser-extension';
import { EXTENSION_EVENTS, RPC_METHODS } from '../../../config';
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

  it('should terminate instance if permissions are revoked', async () => {
    const mockTerminate = jest.fn().mockResolvedValue(undefined);
    const mockRequest = jest.fn().mockResolvedValue([]);

    instance.getProvider = jest.fn().mockReturnValue({
      request: mockRequest,
    }) as unknown as () => SDKProvider;

    instance.terminate = mockTerminate;
    instance.extensionActive = true; // Ensure extension is active

    const mockBrowserExtension = {
      on: jest.fn((event: string, callback: (accounts: string[]) => void) => {
        if (event === EXTENSION_EVENTS.ACCOUNTS_CHANGED) {
          // Directly call the callback to simulate the event
          callback([]);
        }
      }),
    };

    (getBrowserExtension as jest.Mock).mockReturnValue(mockBrowserExtension);

    await setupExtensionPreferences(instance);

    expect(mockRequest).toHaveBeenCalledWith({
      method: RPC_METHODS.WALLET_GETPERMISSIONS,
      params: [],
    });

    expect(mockTerminate).toHaveBeenCalled();
  });
});
