import { checkInstallation } from '../services/MetaMaskInstaller/checkInstallation';
import { redirectToProperInstall } from '../services/MetaMaskInstaller/redirectToProperInstall';
import { startDesktopOnboarding } from '../services/MetaMaskInstaller/startDesktopOnboarding';
import { startInstaller } from '../services/MetaMaskInstaller/startInstaller';
import { RemoteConnection } from '../services/RemoteConnection';
import { MetaMaskInstaller } from './MetaMaskInstaller';
import { PlatformManager } from './PlatfformManager';

jest.mock('../services/MetaMaskInstaller/checkInstallation');
jest.mock('../services/MetaMaskInstaller/redirectToProperInstall');
jest.mock('../services/MetaMaskInstaller/startDesktopOnboarding');
jest.mock('../services/MetaMaskInstaller/startInstaller');

describe('MetaMaskInstaller', () => {
  let mockPlatformManager: jest.Mocked<PlatformManager>;
  let mockProviderService: jest.Mocked<RemoteConnection>;
  let installer: MetaMaskInstaller;

  beforeEach(() => {
    mockPlatformManager = {} as jest.Mocked<PlatformManager>;
    mockProviderService = {} as jest.Mocked<RemoteConnection>;

    installer = new MetaMaskInstaller({
      remote: mockProviderService,
      platformManager: mockPlatformManager,
      debug: false,
      preferDesktop: false,
    });
  });

  it('should properly initialize', () => {
    expect(installer.state.remote).toBe(mockProviderService);
    expect(installer.state.platformManager).toBe(mockPlatformManager);
    expect(installer.state.debug).toBe(false);
    expect(installer.state.preferDesktop).toBe(false);
    expect(installer.state.isInstalling).toBe(false);
    expect(installer.state.hasInstalled).toBe(false);
    expect(installer.state.resendRequest).toBeNull();
  });

  it('should start desktop onboarding', async () => {
    await installer.startDesktopOnboarding();

    expect(startDesktopOnboarding).toHaveBeenCalled();
  });

  it('should redirect to proper install', async () => {
    await installer.redirectToProperInstall();

    expect(redirectToProperInstall).toHaveBeenCalledWith(installer);
  });

  it('should check installation', async () => {
    await installer.checkInstallation();

    expect(checkInstallation).toHaveBeenCalledWith(installer);
  });

  it('should start installer with wait set to false', async () => {
    await installer.start({ wait: false });

    expect(startInstaller).toHaveBeenCalledWith(installer, { wait: false });
  });

  it('should start installer with wait set to true', async () => {
    await installer.start({ wait: true });

    expect(startInstaller).toHaveBeenCalledWith(installer, { wait: true });
  });
});
