import MetaMaskOnboarding from '@metamask/onboarding';
import { Ethereum } from '../Ethereum';
import * as loggerModule from '../../utils/logger';
import { startDesktopOnboarding } from './startDesktopOnboarding';

jest.mock('@metamask/onboarding');

jest.mock('../Ethereum', () => ({
  Ethereum: {
    destroy: jest.fn(),
  },
}));

describe('startDesktopOnboarding', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');
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

    global.window = {
      ethereum: {},
    } as any;
  });

  it('should log debug message when debug is enabled', async () => {
    await startDesktopOnboarding();

    expect(spyLogger).toHaveBeenCalledWith(
      '[MetamaskInstaller: startDesktopOnboarding() starting desktop onboarding',
    );
  });

  it('should call Ethereum.destroy', async () => {
    await startDesktopOnboarding();

    expect(Ethereum.destroy).toHaveBeenCalled();
  });

  it('should delete window.ethereum', async () => {
    await startDesktopOnboarding();

    expect((window as any).ethereum).toBeUndefined();
  });

  it('should call MetaMaskOnboarding.startOnboarding', async () => {
    mockStartOnboarding.mockImplementation();

    await startDesktopOnboarding();

    expect(mockStartOnboarding).toHaveBeenCalled();
  });
});
