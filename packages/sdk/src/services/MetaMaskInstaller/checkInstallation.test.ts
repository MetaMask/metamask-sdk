import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import { checkInstallation } from './checkInstallation';

describe('checkInstallation', () => {
  let instance: MetaMaskInstaller;
  const mockIsMetaMaskInstalled = jest.fn();
  const mockRedirectToProperInstall = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        platformManager: { isMetaMaskInstalled: mockIsMetaMaskInstalled },
      },
      redirectToProperInstall: mockRedirectToProperInstall,
    } as unknown as MetaMaskInstaller;
  });

  it('should log debug message when debug is enabled and MetaMask is installed', async () => {
    mockIsMetaMaskInstalled.mockReturnValue(true);
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    instance.state.debug = true;

    await checkInstallation(instance);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'MetamaskInstaller::checkInstallation() isInstalled=true',
    );
  });

  it('should not log debug message when debug is disabled', async () => {
    mockIsMetaMaskInstalled.mockReturnValue(true);
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await checkInstallation(instance);

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should return true if MetaMask is already installed', async () => {
    mockIsMetaMaskInstalled.mockReturnValue(true);

    const result = await checkInstallation(instance);

    expect(result).toBe(true);
  });

  it('should not call redirectToProperInstall if MetaMask is already installed', async () => {
    mockIsMetaMaskInstalled.mockReturnValue(true);

    await checkInstallation(instance);

    expect(mockRedirectToProperInstall).not.toHaveBeenCalled();
  });

  it('should call redirectToProperInstall if MetaMask is not installed', async () => {
    mockIsMetaMaskInstalled.mockReturnValue(false);
    mockRedirectToProperInstall.mockResolvedValue(true);

    await checkInstallation(instance);

    expect(mockRedirectToProperInstall).toHaveBeenCalled();
  });

  it('should return the result of redirectToProperInstall if MetaMask is not installed', async () => {
    mockIsMetaMaskInstalled.mockReturnValue(false);
    mockRedirectToProperInstall.mockResolvedValue(false);

    const result = await checkInstallation(instance);

    expect(result).toBe(false);
  });
});
