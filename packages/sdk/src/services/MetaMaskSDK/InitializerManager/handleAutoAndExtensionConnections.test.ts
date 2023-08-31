import { MetaMaskSDK } from '../../../sdk';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import { connectWithExtensionProvider } from '../ProviderManager';
import { handleAutoAndExtensionConnections } from './handleAutoAndExtensionConnections';

jest.mock('../ProviderManager', () => ({
  connectWithExtensionProvider: jest.fn(),
}));

describe('handleAutoAndExtensionConnections', () => {
  let instance: MetaMaskSDK;
  const mockConnect = jest.fn(
    () => new Promise((resolve) => setTimeout(resolve, 0)),
  );
  const mockIsDesktopWeb = jest.fn();
  const mockConnectWithExtensionProvider =
    connectWithExtensionProvider as jest.Mock;
  const localStorageMock = {
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectWithExtensionProvider.mockResolvedValue(undefined);
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
