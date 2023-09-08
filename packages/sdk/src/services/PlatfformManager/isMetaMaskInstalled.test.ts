import { PlatformManager } from '../../Platform/PlatfformManager';
import { Ethereum } from '../Ethereum';
import { isMetaMaskInstalled } from './isMetaMaskInstalled';

jest.mock('../Ethereum');

describe('isMetaMaskInstalled', () => {
  let instance: jest.Mocked<PlatformManager>;

  const mockEthereumGetProvider = Ethereum.getProvider as jest.MockedFunction<
    typeof Ethereum.getProvider
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEthereumGetProvider.mockReturnValue({
      isMetaMask: false,
      isConnected: () => false,
    } as any);

    instance = {
      state: {
        debug: false,
      },
    } as unknown as jest.Mocked<PlatformManager>;

    global.window = {} as any;
  });

  it('should console debug when state.debug is true', () => {
    instance.state.debug = true;
    jest.spyOn(console, 'debug').mockImplementation();

    isMetaMaskInstalled(instance);

    expect(console.debug).toHaveBeenCalled();
  });

  it('should return true when Ethereum.getProvider isMetaMask and isConnected are true', () => {
    mockEthereumGetProvider.mockReturnValue({
      isMetaMask: true,
      isConnected: () => true,
    } as any);

    expect(isMetaMaskInstalled(instance)).toBe(true);
  });

  it('should return false when Ethereum.getProvider isMetaMask is false', () => {
    mockEthereumGetProvider.mockReturnValue({
      isMetaMask: false,
      isConnected: () => true,
    } as any);

    expect(isMetaMaskInstalled(instance)).toBe(false);
  });

  it('should return false when Ethereum.getProvider isConnected is false', () => {
    mockEthereumGetProvider.mockReturnValue({
      isMetaMask: true,
      isConnected: () => false,
    } as any);

    expect(isMetaMaskInstalled(instance)).toBe(false);
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

    expect(isMetaMaskInstalled(instance)).toBe(true);
  });

  it('should return false when neither Ethereum.getProvider nor window.ethereum exists', () => {
    global.window = {} as any;

    expect(isMetaMaskInstalled(instance)).toBe(false);
  });
});
