import { EventType, TrackingEvents } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../../sdk';
import { MetaMaskSDKEvent } from '../../../types/MetaMaskSDKEvents';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import * as loggerModule from '../../../utils/logger';
import { connectWithExtensionProvider } from './connectWithExtensionProvider';

jest.mock('../../../sdk');

describe('connectWithExtensionProvider', () => {
  let instance: MetaMaskSDK;
  const mockRequest: jest.Mock = jest.fn(
    () => new Promise((resolve) => setTimeout(resolve, 0)),
  );
  const spyLogger = jest.spyOn(loggerModule, 'logger');
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
    const error = new Error('User rejected the request');
    mockRequest.mockRejectedValue(error);

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const originalProvider = instance.activeProvider;
    instance.sdkProvider = originalProvider;

    await expect(connectWithExtensionProvider(instance)).rejects.toThrow(
      'User rejected the request',
    );

    // Should log the error
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `[MetaMaskSDK: connectWithExtensionProvider()] can't request accounts error`,
      error,
    );

    // Should emit ConnectWithResponse event with error
    expect(instance.emit).toHaveBeenCalledWith(
      MetaMaskSDKEvent.ConnectWithResponse,
      { error },
    );

    // Should send analytics event for rejection
    expect(mockSendAnalyticsEvent).toHaveBeenCalledWith({
      event: TrackingEvents.REJECTED,
    });

    // Should restore original provider
    expect(instance.activeProvider).toBe(originalProvider);
    expect((global.window as any).ethereum).toBe(originalProvider);

    consoleWarnSpy.mockRestore();
  });

  it('should log debug information', async () => {
    await connectWithExtensionProvider(instance);

    expect(spyLogger).toHaveBeenCalledWith(
      '[MetaMaskSDK: connectWithExtensionProvider()] ',
      instance,
    );

    expect(spyLogger).toHaveBeenLastCalledWith(
      '[MetaMaskSDK: connectWithExtensionProvider()] accounts=undefined',
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

  it('should handle error when analytics is disabled', async () => {
    const error = new Error('Connection cancelled');
    mockRequest.mockRejectedValue(error);

    // Disable analytics
    instance.options.enableAnalytics = false;

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const originalProvider = instance.activeProvider;
    instance.sdkProvider = originalProvider;

    await expect(connectWithExtensionProvider(instance)).rejects.toThrow(
      'Connection cancelled',
    );

    // Should still emit the error event
    expect(instance.emit).toHaveBeenCalledWith(
      MetaMaskSDKEvent.ConnectWithResponse,
      { error },
    );

    // Should NOT send analytics event when disabled
    expect(mockSendAnalyticsEvent).not.toHaveBeenCalledWith({
      event: TrackingEvents.REJECTED,
    });

    consoleWarnSpy.mockRestore();
  });

  it('should handle error when sdkProvider is not set', async () => {
    const error = new Error('User denied access');
    mockRequest.mockRejectedValue(error);

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    instance.sdkProvider = undefined; // No previous provider to restore

    await expect(connectWithExtensionProvider(instance)).rejects.toThrow(
      'User denied access',
    );

    // Should emit error event
    expect(instance.emit).toHaveBeenCalledWith(
      MetaMaskSDKEvent.ConnectWithResponse,
      { error },
    );

    // activeProvider should be set to extension (not restored since no sdkProvider)
    expect(instance.activeProvider).toStrictEqual((global.window as any).extension);

    consoleWarnSpy.mockRestore();
  });
});
