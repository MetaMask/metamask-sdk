import { EventType, TrackingEvents } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../../sdk';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import { connectWithExtensionProvider } from './connectWithExtensionProvider';

jest.mock('../../../sdk');

describe('connectWithExtensionProvider', () => {
  let instance: MetaMaskSDK;
  const mockRequest: jest.Mock = jest.fn(
    () => new Promise((resolve) => setTimeout(resolve, 0)),
  );

  const mockSendAnalyticsEvent = jest.fn();

  const mockLocalStorage = {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest.mockResolvedValue(undefined);

    instance = {
      debug: false,
      sdkProvider: null,
      activeProvider: {
        request: mockRequest,
      },
      options: {
        enableAnalytics: true,
      },
      emit: jest.fn(),
      analytics: {
        send: mockSendAnalyticsEvent,
      },
    } as unknown as MetaMaskSDK;

    global.window = {
      extension: { request: mockRequest },
    } as any;

    global.localStorage = mockLocalStorage as any;
  });

  it('should connect with extension provider and update instance properties', async () => {
    await connectWithExtensionProvider(instance);

    expect(mockRequest).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      STORAGE_PROVIDER_TYPE,
      'extension',
    );

    expect(instance.emit).toHaveBeenCalledWith(
      EventType.PROVIDER_UPDATE,
      PROVIDER_UPDATE_TYPE.EXTENSION,
    );

    expect(mockSendAnalyticsEvent).toHaveBeenCalledWith({
      event: TrackingEvents.SDK_USE_EXTENSION,
    });
  });

  it('should handle error during account request', async () => {
    mockRequest.mockRejectedValue(new Error('Some error'));

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    await connectWithExtensionProvider(instance);

    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should log debug information if instance.debug is true', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.debug = true;

    await connectWithExtensionProvider(instance);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      'SDK::connectWithExtensionProvider()',
      instance,
    );

    expect(consoleDebugSpy).toHaveBeenLastCalledWith(
      'SDK::connectWithExtensionProvider() accounts',
      undefined,
    );
  });

  it('should set window.ethereum to window.extension', async () => {
    await connectWithExtensionProvider(instance);

    expect((global.window as any).ethereum).toBe(
      (global.window as any).extension,
    );
  });

  it('should send an analytics event if instance.analytics is defined', async () => {
    await connectWithExtensionProvider(instance);

    expect(mockSendAnalyticsEvent).toHaveBeenCalledWith({
      event: TrackingEvents.SDK_USE_EXTENSION,
    });
  });

  it('should store a copy of the activeProvider in sdkProvider', async () => {
    const oldProvider = instance.activeProvider;
    await connectWithExtensionProvider(instance);
    expect(instance.sdkProvider).toBe(oldProvider);
  });

  it('should set instance.extensionActive to true if connection is successful', async () => {
    await connectWithExtensionProvider(instance);
    expect(instance.extensionActive).toBe(true);
  });
});
