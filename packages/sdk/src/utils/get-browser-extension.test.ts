import { MetaMaskSDK } from '../sdk';
import { eip6963RequestProvider } from './eip6963RequestProvider';
import { getBrowserExtension } from './get-browser-extension';

jest.mock('./eip6963RequestProvider');

describe('getBrowserExtension', () => {
  let sdkInstance: MetaMaskSDK;

  beforeEach(() => {
    jest.clearAllMocks();
    global.window = {} as any;
    sdkInstance = {
      options: { dappMetadata: {} },
      platformManager: { getPlatformType: jest.fn() },
    } as unknown as MetaMaskSDK;
  });

  afterEach(() => {
    global.window = undefined as any;
  });

  it('should throw if window is undefined', async () => {
    global.window = undefined as any;
    await expect(
      getBrowserExtension({ mustBeMetaMask: true, sdkInstance }),
    ).rejects.toThrow('window not available');
  });

  it('should return provider from EIP-6963 if available', async () => {
    const mockProvider = { isMetaMask: true };
    (eip6963RequestProvider as jest.Mock).mockResolvedValue(mockProvider);

    const result = await getBrowserExtension({
      mustBeMetaMask: true,
      sdkInstance,
    });
    expect(result).toStrictEqual(expect.objectContaining({ isMetaMask: true }));
  });

  it('should fallback to window.ethereum only if not requiring MetaMask', async () => {
    const mockProvider = { isMetaMask: false };
    (eip6963RequestProvider as jest.Mock).mockRejectedValue(new Error());
    global.window = { ethereum: mockProvider } as any;

    const result = await getBrowserExtension({
      mustBeMetaMask: false,
      sdkInstance,
    });
    expect(result).toStrictEqual(
      expect.objectContaining({ isMetaMask: false }),
    );
  });

  it('should throw if no provider found', async () => {
    (eip6963RequestProvider as jest.Mock).mockRejectedValue(new Error());
    global.window = {} as any;

    await expect(
      getBrowserExtension({ mustBeMetaMask: false, sdkInstance }),
    ).rejects.toThrow('Provider not found');
  });
});
