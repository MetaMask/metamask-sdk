import { PlatformType } from '@metamask/sdk-communication-layer';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import * as loggerModule from '../../utils/logger';
import { redirectToProperInstall } from './redirectToProperInstall';

describe('redirectToProperInstall', () => {
  let instance: MetaMaskInstaller;
  const mockGetPlatformType = jest.fn();
  const mockStartConnection = jest.fn();
  const mockStartDesktopOnboarding = jest.fn();
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        platformManager: { getPlatformType: mockGetPlatformType },
        debug: false,
        preferDesktop: false,
        isInstalling: false,
        hasInstalled: false,
        remote: { startConnection: mockStartConnection },
      },
      startDesktopOnboarding: mockStartDesktopOnboarding,
    } as unknown as MetaMaskInstaller;
  });

  it('should log debug message', async () => {
    mockGetPlatformType.mockReturnValue(PlatformType.DesktopWeb);

    await redirectToProperInstall(instance);

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should return false if platform is MetaMaskMobileWebview', async () => {
    mockGetPlatformType.mockReturnValue(PlatformType.MetaMaskMobileWebview);

    const result = await redirectToProperInstall(instance);

    expect(result).toBe(false);
  });

  it('should start desktop onboarding if platform is DesktopWeb and preferDesktop is true', async () => {
    mockGetPlatformType.mockReturnValue(PlatformType.DesktopWeb);
    instance.state.preferDesktop = true;

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
    expect(instance.state.isInstalling).toBe(false);
    expect(instance.state.hasInstalled).toBe(true);
  });

  it('should handle error during remote connection', async () => {
    mockGetPlatformType.mockReturnValue(PlatformType.DesktopWeb);
    mockStartConnection.mockRejectedValue(new Error('Connection error'));

    await expect(redirectToProperInstall(instance)).rejects.toThrow(
      'Connection error',
    );
    expect(instance.state.isInstalling).toBe(false);
  });
});
