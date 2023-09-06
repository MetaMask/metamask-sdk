import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import { wait as waitPromise } from '../../utils/wait';
import { startInstaller } from './startInstaller';

jest.mock('../../utils/wait', () => ({
  wait: jest.fn(),
}));

describe('startInstaller', () => {
  let instance: MetaMaskInstaller;
  const mockCheckInstallation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
      },
      checkInstallation: mockCheckInstallation,
    } as unknown as MetaMaskInstaller;
  });

  it('should log debug message when debug is enabled', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;

    await startInstaller(instance, { wait: false });

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      'MetamaskInstaller::start() wait=false',
    );
  });

  it('should wait when the wait parameter is true', async () => {
    await startInstaller(instance, { wait: true });

    expect(waitPromise).toHaveBeenCalledWith(1000);
  });

  it('should not wait when the wait parameter is false', async () => {
    await startInstaller(instance, { wait: false });

    expect(waitPromise).not.toHaveBeenCalled();
  });

  it('should call checkInstallation', async () => {
    mockCheckInstallation.mockResolvedValue(true);

    const result = await startInstaller(instance, { wait: false });

    expect(mockCheckInstallation).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
