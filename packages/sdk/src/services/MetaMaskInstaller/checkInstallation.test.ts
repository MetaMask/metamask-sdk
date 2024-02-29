import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import * as loggerModule from '../../utils/logger';
import { checkInstallation } from './checkInstallation';

describe('checkInstallation', () => {
  let instance: MetaMaskInstaller;
  const mockIsMetaMaskInstalled = jest.fn();
  const mockRedirectToProperInstall = jest.fn();
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        platformManager: { isMetaMaskInstalled: mockIsMetaMaskInstalled },
      },
      redirectToProperInstall: mockRedirectToProperInstall,
    } as unknown as MetaMaskInstaller;
  });

  it('should log debug message', async () => {
    mockIsMetaMaskInstalled.mockReturnValue(true);

    await checkInstallation(instance);

    expect(spyLogger).toHaveBeenCalledWith(
      `[MetamaskInstaller: checkInstallation()] isInstalled=${true}`,
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
