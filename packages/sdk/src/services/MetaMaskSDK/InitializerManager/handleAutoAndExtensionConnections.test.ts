import { SendAnalytics } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../../sdk';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import { connectWithExtensionProvider } from '../ProviderManager';
import { ANALYTICS_CONSTANTS } from '../../Analytics';
import { handleAutoAndExtensionConnections } from './handleAutoAndExtensionConnections';

jest.mock('../ProviderManager', () => ({
  connectWithExtensionProvider: jest.fn(),
}));

jest.mock('@metamask/sdk-communication-layer', () => ({
  SendAnalytics: jest.fn(),
  TrackingEvents: {
    SDK_EXTENSION_UTILIZED: 'SDK_EXTENSION_UTILIZED',
  },
}));

describe('handleAutoAndExtensionConnections', () => {
  let instance: MetaMaskSDK;
  const mockConnect = jest.fn(
    () => new Promise((resolve) => setTimeout(resolve, 0)),
  );
  const mockIsDesktopWeb = jest.fn();
  const mockSendAnalytics = SendAnalytics as jest.Mock;
  const mockConnectWithExtensionProvider =
    connectWithExtensionProvider as jest.Mock;
  const localStorageMock = {
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectWithExtensionProvider.mockResolvedValue(undefined);
    mockSendAnalytics.mockResolvedValue(undefined);

    global.localStorage = localStorageMock as any;

    instance = {
      debug: false,
      options: {
        checkInstallationImmediately: false,
      },
      connect: mockConnect,
      platformManager: {
        isDesktopWeb: mockIsDesktopWeb,
      },
      _initialized: false,
    } as unknown as MetaMaskSDK;
  });

  it('should send SDK_EXTENSION_UTILIZED analytics event with the right metadata when remoteConnection available', async () => {
    instance.remoteConnection = {
      state: {
        connector: {
          state: {
            originatorInfo: {
              id: 'defaultId',
            },
          },
        },
      },
    } as unknown as MetaMaskSDK['remoteConnection'];

    const analyticsData = {
      id: ANALYTICS_CONSTANTS.DEFAULT_ID,
      event: 'SDK_EXTENSION_UTILIZED',
      ...instance.remoteConnection?.state.connector?.state.originatorInfo,
      commLayerVersion: ANALYTICS_CONSTANTS.NO_VERSION,
    };

    await handleAutoAndExtensionConnections(instance, true);

    expect(mockSendAnalytics).toHaveBeenCalled();
    expect(mockSendAnalytics).toHaveBeenCalledWith(
      analyticsData,
      expect.any(String),
    );
  });

  it('should NOT send SDK_EXTENSION_UTILIZED analytics event with the right metadata when remoteConnection is NOT available', async () => {
    instance.remoteConnection = undefined;

    await handleAutoAndExtensionConnections(instance, true);

    expect(mockSendAnalytics).not.toHaveBeenCalled();
  });

  it('should warn if checkInstallationImmediately is true and not on web desktop', async () => {
    mockIsDesktopWeb.mockReturnValue(false);
    instance.options.checkInstallationImmediately = true;
    const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
    await handleAutoAndExtensionConnections(instance, false);
    expect(consoleWarnMock).toHaveBeenCalled();
  });

  it('should try to connect with extension if preferExtension is true', async () => {
    await handleAutoAndExtensionConnections(instance, true);
    expect(mockConnectWithExtensionProvider).toHaveBeenCalledWith(instance);
  });

  it('should remove STORAGE_PROVIDER_TYPE if connecting with extension fails', async () => {
    mockConnectWithExtensionProvider.mockRejectedValue(
      new Error('Failed to connect'),
    );
    await handleAutoAndExtensionConnections(instance, true);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      STORAGE_PROVIDER_TYPE,
    );
  });

  it('should autoconnect if checkInstallationImmediately is true and on web desktop', async () => {
    mockIsDesktopWeb.mockReturnValue(true);
    instance.options.checkInstallationImmediately = true;
    await handleAutoAndExtensionConnections(instance, false);
    expect(mockConnect).toHaveBeenCalled();
  });

  it('should not autoconnect if not on web desktop', async () => {
    mockIsDesktopWeb.mockReturnValue(false);
    instance.options.checkInstallationImmediately = true;
    await handleAutoAndExtensionConnections(instance, false);
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('should set _initialized to true', async () => {
    await handleAutoAndExtensionConnections(instance, false);
    expect(instance._initialized).toBe(true);
  });
});
