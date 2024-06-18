import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../../sdk';
import { handleAutoAndExtensionConnections } from './handleAutoAndExtensionConnections';
import { initializeProviderAndEventListeners } from './initializeProviderAndEventListeners';
import { performSDKInitialization } from './performSDKInitialization';
import { setupAnalytics } from './setupAnalytics';
import { setupDappMetadata } from './setupDappMetadata';
import { setupExtensionPreferences } from './setupExtensionPreferences';
import { setupPlatformManager } from './setupPlatformManager';
import { setupRemoteConnectionAndInstaller } from './setupRemoteConnectionAndInstaller';
import { setupStorageManager } from './setupStorage';

jest.mock('./setupAnalytics');
jest.mock('./setupDappMetadata');
jest.mock('./setupExtensionPreferences');
jest.mock('./setupPlatformManager');
jest.mock('./setupRemoteConnectionAndInstaller');
jest.mock('./setupStorage');
jest.mock('./initializeProviderAndEventListeners');
jest.mock('./handleAutoAndExtensionConnections');
jest.mock('./initializeI18next');

describe('performSDKInitialization', () => {
  let instance: MetaMaskSDK;

  let mockSetupExtensionPreferencesReturnValue: Awaited<
    ReturnType<typeof setupExtensionPreferences>
  >;
  const mockSetupExtensionPreferences = setupExtensionPreferences as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    instance = {
      options: {},
      emit: jest.fn(),
    } as unknown as MetaMaskSDK;

    mockSetupExtensionPreferencesReturnValue = {
      shouldReturn: false,
      preferExtension: false,
      metamaskBrowserExtension: undefined,
    };

    mockSetupExtensionPreferences.mockImplementation(() => {
      return mockSetupExtensionPreferencesReturnValue;
    });

    jest.spyOn(console, 'debug').mockImplementation();
  });

  it('should call all setup and initialization functions with the correct arguments', async () => {
    await performSDKInitialization(instance);

    expect(instance.options).toStrictEqual({
      logging: {},
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      enableAnalytics: true,
      injectProvider: true,
      shouldShimWeb3: true,
      useDeeplink: false,
      storage: {
        enabled: true,
      },
    });

    expect(setupPlatformManager).toHaveBeenCalledWith(instance);
    expect(setupAnalytics).toHaveBeenCalledWith(instance);
    expect(setupStorageManager).toHaveBeenCalledWith(instance);
    expect(setupDappMetadata).toHaveBeenCalledWith(instance);
    expect(setupExtensionPreferences).toHaveBeenCalledWith(instance);
    expect(setupRemoteConnectionAndInstaller).toHaveBeenCalledWith(
      instance,
      mockSetupExtensionPreferencesReturnValue.metamaskBrowserExtension,
    );
    expect(initializeProviderAndEventListeners).toHaveBeenCalledWith(instance);
    expect(handleAutoAndExtensionConnections).toHaveBeenCalledWith(
      instance,
      expect.any(Boolean),
    );
  });

  it('should set debug to true if developerMode is true', async () => {
    instance.options.logging = {
      developerMode: true,
    };

    await performSDKInitialization(instance);

    expect(instance.debug).toBe(true);
  });

  it('should set debug to true if options.logging.sdk is true', async () => {
    instance.options.logging = {
      sdk: true,
    };

    await performSDKInitialization(instance);

    expect(instance.debug).toBe(true);
  });

  it('should set debug to false if developerMode and options.logging.sdk are false', async () => {
    instance.options.logging = {
      developerMode: false,
      sdk: false,
    };

    await performSDKInitialization(instance);

    expect(instance.debug).toBe(false);
  });

  it('should set debug to false if developerMode is false and options.logging.sdk is not defined', async () => {
    instance.options.logging = {
      developerMode: false,
    };

    await performSDKInitialization(instance);

    expect(instance.debug).toBe(false);
  });

  it('should return if setupExtensionPreferences returns shouldReturn as true', async () => {
    mockSetupExtensionPreferencesReturnValue.shouldReturn = true;

    await performSDKInitialization(instance);

    expect(setupPlatformManager).toHaveBeenCalled();
    expect(setupAnalytics).toHaveBeenCalled();
    expect(setupStorageManager).toHaveBeenCalled();
    expect(setupDappMetadata).toHaveBeenCalled();
    expect(setupExtensionPreferences).toHaveBeenCalled();
    expect(setupRemoteConnectionAndInstaller).not.toHaveBeenCalled();
    expect(initializeProviderAndEventListeners).not.toHaveBeenCalled();
    expect(handleAutoAndExtensionConnections).not.toHaveBeenCalled();
  });
});
