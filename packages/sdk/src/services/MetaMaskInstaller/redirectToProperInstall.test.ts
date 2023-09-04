import { PlatformType } from '@metamask/sdk-communication-layer';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import { redirectToProperInstall } from './redirectToProperInstall';

describe('redirectToProperInstall', () => {
  let instance: MetaMaskInstaller;
  const mockGetPlatformType = jest.fn();
  const mockStartConnection = jest.fn();
  const mockStartDesktopOnboarding = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      platformManager: { getPlatformType: mockGetPlatformType },
      debug: false,
      preferDesktop: false,
      isInstalling: false,
      hasInstalled: false,
      startDesktopOnboarding: mockStartDesktopOnboarding,
      remote: { startConnection: mockStartConnection },
    } as unknown as MetaMaskInstaller;
  });

  it('should log debug message when debug is enabled', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    mockGetPlatformType.mockReturnValue(PlatformType.DesktopWeb);
    instance.debug = true;

    await redirectToProperInstall(instance);

    expect(consoleDebugSpy).toHaveBeenCalled();
  });

  it('should return false if platform is MetaMaskMobileWebview', async () => {
    mockGetPlatformType.mockReturnValue(PlatformType.MetaMaskMobileWebview);

    const result = await redirectToProperInstall(instance);

    expect(result).toBe(false);
  });

  it('should start desktop onboarding if platform is DesktopWeb and preferDesktop is true', async () => {
    mockGetPlatformType.mockReturnValue(PlatformType.DesktopWeb);
    instance.preferDesktop = true;

    const result = await redirectToProperInstall(instance);

    expect(mockStartDesktopOnboarding).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should start remote connection if platform is not MetaMaskMobileWebview', async () => {
    mockGetPlatformType.mockReturnValue(PlatformType.DesktopWeb);
    mockStartConnection.mockResolvedValue(true);

    const result = await redirectToProperInstall(instance);

    expect(mockStartConnection).toHaveBeenCalled();
    expect(result).toBe(true);
    expect(instance.isInstalling).toBe(false);
    expect(instance.hasInstalled).toBe(true);
  });

  it('should handle error during remote connection', async () => {
    mockGetPlatformType.mockReturnValue(PlatformType.DesktopWeb);
    mockStartConnection.mockRejectedValue(new Error('Connection error'));

    await expect(redirectToProperInstall(instance)).rejects.toThrow(
      'Connection error',
    );
    expect(instance.isInstalling).toBe(false);
  });
});
