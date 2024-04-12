import { ProviderService } from '../services/ProviderService';
import { MetaMaskInstaller } from './MetaMaskInstaller';
import { PlatformManager } from './PlatfformManager';

describe('MetaMaskInstaller', () => {
  let mockPlatformManager: jest.Mocked<PlatformManager>;
  let mockProviderService: jest.Mocked<ProviderService>;
  let installer: MetaMaskInstaller;

  beforeEach(() => {
    installer = new MetaMaskInstaller({
      remote: mockProviderService,
      platformManager: mockPlatformManager,
      debug: false,
    });
  });

  it('should properly initialize', () => {
    expect(installer.state.remote).toBe(mockProviderService);
    expect(installer.state.platformManager).toBe(mockPlatformManager);
    expect(installer.state.debug).toBe(false);
  });

  it('should start desktop onboarding', async () => {
    const startDesktopOnboardingMock = jest.fn();
    installer.startDesktopOnboarding = startDesktopOnboardingMock;

    await installer.startDesktopOnboarding();

    expect(startDesktopOnboardingMock).toHaveBeenCalled();
  });

  it('should redirect to proper install', async () => {
    const redirectToProperInstallMock = jest.fn();
    installer.redirectToProperInstall = redirectToProperInstallMock;

    await installer.redirectToProperInstall();

    expect(redirectToProperInstallMock).toHaveBeenCalled();
  });

  it('should check installation', async () => {
    const checkInstallationMock = jest.fn();
    installer.checkInstallation = checkInstallationMock;

    await installer.checkInstallation();

    expect(checkInstallationMock).toHaveBeenCalled();
  });

  it('should start installer', async () => {
    const startInstallerMock = jest.fn();
    installer.start = startInstallerMock;

    await installer.start({ wait: false });

    expect(startInstallerMock).toHaveBeenCalledWith({ wait: false });
  });
});
