import { Ethereum } from '../Ethereum';
import * as loggerModule from '../../utils/logger';
import { isMetaMaskInstalled } from './isMetaMaskInstalled';

jest.mock('../Ethereum');

describe('isMetaMaskInstalled', () => {
  const mockEthereumGetProvider = Ethereum.getProvider as jest.MockedFunction<
    typeof Ethereum.getProvider
  >;
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    mockEthereumGetProvider.mockReturnValue({
      isMetaMask: false,
      isConnected: () => false,
    } as any);

    global.window = {} as any;
  });

  it('should console debug', () => {
    isMetaMaskInstalled();

    expect(spyLogger).toHaveBeenCalledWith(
      `[PlatfformManager: isMetaMaskInstalled()] isMetaMask=${false} isConnected=${false}`,
    );
  });

  it('should return true when Ethereum.getProvider isMetaMask and isConnected are true', () => {
    mockEthereumGetProvider.mockReturnValue({
      isMetaMask: true,
      isConnected: () => true,
    } as any);

    expect(isMetaMaskInstalled()).toBe(true);
  });

  it('should return false when Ethereum.getProvider isMetaMask is false', () => {
    mockEthereumGetProvider.mockReturnValue({
      isMetaMask: false,
      isConnected: () => true,
    } as any);

    expect(isMetaMaskInstalled()).toBe(false);
  });

  it('should return false when Ethereum.getProvider isConnected is false', () => {
    mockEthereumGetProvider.mockReturnValue({
      isMetaMask: true,
      isConnected: () => false,
    } as any);

    expect(isMetaMaskInstalled()).toBe(false);
  });

  it('should return true when window.ethereum isMetaMask and isConnected are true', () => {
    mockEthereumGetProvider.mockReturnValue(
      undefined as unknown as ReturnType<typeof Ethereum.getProvider>,
    );

    global.window = {
      ethereum: {
        isMetaMask: true,
        isConnected: () => true,
      },
    } as any;

    expect(isMetaMaskInstalled()).toBe(true);
  });

  it('should return false when neither Ethereum.getProvider nor window.ethereum exists', () => {
    global.window = {} as any;

    expect(isMetaMaskInstalled()).toBe(false);
  });
});
