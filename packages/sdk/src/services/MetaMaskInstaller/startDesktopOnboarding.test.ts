import MetaMaskOnboarding from '@metamask/onboarding';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import { Ethereum } from '../Ethereum';
import { startDesktopOnboarding } from './startDesktopOnboarding';

jest.mock('@metamask/onboarding');

jest.mock('../Ethereum', () => ({
  Ethereum: {
    destroy: jest.fn(),
  },
}));

describe('startDesktopOnboarding', () => {
  let instance: MetaMaskInstaller;

  const mockMetaMaskOnboarding = MetaMaskOnboarding as jest.MockedClass<
    typeof MetaMaskOnboarding
  >;

  const mockStartOnboarding = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockMetaMaskOnboarding.mockImplementation(
      () =>
        ({
          startOnboarding: mockStartOnboarding,
        } as unknown as MetaMaskOnboarding),
    );

    instance = {
      state: {
        debug: false,
      },
    } as unknown as MetaMaskInstaller;

    global.window = {
      ethereum: {},
    } as any;
  });

  it('should log debug message when debug is enabled', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;
    instance.state.debug = true;

    await startDesktopOnboarding(instance);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      'MetamaskInstaller::startDesktopOnboarding()',
    );
  });

  it('should call Ethereum.destroy', async () => {
    await startDesktopOnboarding(instance);

    expect(Ethereum.destroy).toHaveBeenCalled();
  });

  it('should delete window.ethereum', async () => {
    await startDesktopOnboarding(instance);

    expect((window as any).ethereum).toBeUndefined();
  });

  it('should call MetaMaskOnboarding.startOnboarding', async () => {
    mockStartOnboarding.mockImplementation();

    await startDesktopOnboarding(instance);

    expect(mockStartOnboarding).toHaveBeenCalled();
  });
});
