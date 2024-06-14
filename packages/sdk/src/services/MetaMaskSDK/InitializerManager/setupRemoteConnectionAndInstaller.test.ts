import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { MetaMaskInstaller } from '../../../Platform/MetaMaskInstaller';
import { MetaMaskSDK, MetaMaskSDKOptions } from '../../../sdk';
import { RemoteConnection } from '../../RemoteConnection';
import { setupRemoteConnectionAndInstaller } from './setupRemoteConnectionAndInstaller';

jest.mock('../../../Platform/PlatfformManager');
jest.mock('../ProviderManager');

jest.mock('../../RemoteConnection', () => {
  return {
    RemoteConnection: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

jest.mock('../../../Platform/MetaMaskInstaller', () => {
  return {
    MetaMaskInstaller: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe('setupRemoteConnectionAndInstaller', () => {
  let instance: MetaMaskSDK;
  let metamaskBrowserExtension: any;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      options: {},
      debug: false,
      terminate: jest.fn(() => {
        return {};
      }),
    } as unknown as MetaMaskSDK;

    metamaskBrowserExtension = {};
  });

  it('should initialize RemoteConnection and MetaMaskInstaller with default options when no options are provided', async () => {
    await setupRemoteConnectionAndInstaller(instance, undefined);

    expect(RemoteConnection).toHaveBeenCalledWith({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      analytics: instance.analytics,
      dappMetadata: instance.options.dappMetadata,
      _source: instance.options._source,
      enableAnalytics: true,
      timer: instance.options.timer,
      sdk: instance,
      platformManager: instance.platformManager,
      transports: instance.options.transports,
      communicationServerUrl: instance.options.communicationServerUrl,
      storage: {
        enabled: true,
      },
      getMetaMaskInstaller: expect.any(Function),
      logging: {
        ...instance.options.logging,
      },
      connectWithExtensionProvider: undefined,
      modals: {
        ...instance.options.modals,
        onPendingModalDisconnect: expect.any(Function),
      },
      preferDesktop: false,
    });

    expect(MetaMaskInstaller).toHaveBeenCalledWith(
      expect.objectContaining({
        remote: instance.remoteConnection,
        platformManager: instance.platformManager,
        debug: instance.debug,
      }),
    );
  });

  it('should handle metamaskBrowserExtension parameter correctly', async () => {
    await setupRemoteConnectionAndInstaller(instance, metamaskBrowserExtension);

    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      }),
    );

    expect(MetaMaskInstaller).toHaveBeenCalledWith({
      remote: instance.remoteConnection,
      platformManager: instance.platformManager,
      preferDesktop: false,
      debug: instance.debug,
    });
  });

  it('should use provided communicationLayerPreference', async () => {
    instance.options = {
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
    } as unknown as MetaMaskSDKOptions;

    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      }),
    );
  });

  it('should use default communicationLayerPreference if not provided', async () => {
    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      }),
    );
  });

  it('should use provided analytics', async () => {
    const mockAnalytics = {};
    instance.analytics = mockAnalytics as any;

    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({ analytics: mockAnalytics }),
    );
  });

  it('should use provided dappMetadata', async () => {
    instance.options = {
      dappMetadata: 'metadata',
    } as unknown as MetaMaskSDKOptions;
    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({ dappMetadata: 'metadata' }),
    );
  });

  it('should handle metamaskBrowserExtension correctly', async () => {
    await setupRemoteConnectionAndInstaller(instance, 'someExtension');
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        connectWithExtensionProvider: expect.any(Function),
      }),
    );
  });

  it('should use provided debug', async () => {
    instance.debug = true;
    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(MetaMaskInstaller).toHaveBeenCalledWith(
      expect.objectContaining({
        debug: true,
      }),
    );
  });

  it('should use default debug if not provided', async () => {
    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(MetaMaskInstaller).toHaveBeenCalledWith(
      expect.objectContaining({
        debug: false,
      }),
    );
  });

  it('should use provided timer', async () => {
    instance.options = { timer: 1000 } as unknown as MetaMaskSDKOptions;

    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        timer: 1000,
      }),
    );
  });

  it('should use provided transports', async () => {
    const mockTransports = [] as any;

    instance.options = {
      transports: mockTransports,
    } as unknown as MetaMaskSDKOptions;

    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        transports: mockTransports,
      }),
    );
  });

  it('should use provided communicationServerUrl', async () => {
    instance.options = {
      communicationServerUrl: 'http://example.com',
    } as unknown as MetaMaskSDKOptions;

    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        communicationServerUrl: 'http://example.com',
      }),
    );
  });

  it('should use provided storage settings', async () => {
    instance.options = {
      storage: { enabled: false },
    } as unknown as MetaMaskSDKOptions;

    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        storage: { enabled: false },
      }),
    );
  });

  it('should use provided logging settings', async () => {
    const mockLogging = {};
    instance.options = {
      logging: mockLogging,
    } as unknown as MetaMaskSDKOptions;

    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        logging: mockLogging,
      }),
    );
  });

  it('should use provided modals settings', async () => {
    const mockModals = {};
    instance.options = { modals: mockModals } as unknown as MetaMaskSDKOptions;

    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(RemoteConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        modals: expect.objectContaining(mockModals),
      }),
    );
  });

  it('should set the initialized RemoteConnection on the instance', async () => {
    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(instance.remoteConnection).toBeDefined();
  });

  it('should set the initialized MetaMaskInstaller on the instance', async () => {
    await setupRemoteConnectionAndInstaller(instance, undefined);
    expect(instance.installer).toBeDefined();
  });
});
