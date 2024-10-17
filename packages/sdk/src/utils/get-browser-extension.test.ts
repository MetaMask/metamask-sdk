import { MetaMaskSDK } from '../sdk';
import { getBrowserExtension } from './get-browser-extension';
import { eip6963RequestProvider } from './eip6963RequestProvider';

jest.mock('./eip6963RequestProvider');

describe('getBrowserExtension', () => {
  let sdkInstance: MetaMaskSDK;

  beforeEach(() => {
    jest.clearAllMocks();

    sdkInstance = {
      options: {
        dappMetadata: {},
      },
      platformManager: {
        getPlatformType: jest.fn(),
      },
    } as unknown as MetaMaskSDK;
  });

  it('should throw an error if window is undefined', async () => {
    global.window = undefined as any;

    await expect(
      getBrowserExtension({ mustBeMetaMask: true, sdkInstance }),
    ).rejects.toThrow('window not available');
  });

  it('should return baseProvider if eip6963RequestProvider resolves successfully', async () => {
    const mockProvider = { isMetaMask: true };
    global.window = { ethereum: {} } as any;
    (eip6963RequestProvider as jest.Mock).mockResolvedValue(mockProvider);

    const res = await getBrowserExtension({
      mustBeMetaMask: true,
      sdkInstance,
    });

    expect(res).toStrictEqual(mockProvider);
  });

  it('should throw an error if eip6963RequestProvider rejects and ethereum is not found in window object', async () => {
    (eip6963RequestProvider as jest.Mock).mockRejectedValue(
      new Error('Provider request failed'),
    );
    global.window = {} as any;

    await expect(
      getBrowserExtension({ mustBeMetaMask: true, sdkInstance }),
    ).rejects.toThrow('Ethereum not found in window object');
  });

  it('should throw an error if no suitable provider is found', async () => {
    (eip6963RequestProvider as jest.Mock).mockRejectedValue(
      new Error('Provider request failed'),
    );
    global.window = { ethereum: { providers: [] } } as any;

    await expect(
      getBrowserExtension({ mustBeMetaMask: true, sdkInstance }),
    ).rejects.toThrow('No suitable provider found');
  });

  it('should return MetaMask provider if mustBeMetaMask is true', async () => {
    const mockProvider = { isMetaMask: true };
    (eip6963RequestProvider as jest.Mock).mockRejectedValue(
      new Error('Provider request failed'),
    );
    global.window = { ethereum: { providers: [mockProvider] } } as any;

    const res = await getBrowserExtension({
      mustBeMetaMask: true,
      sdkInstance,
    });

    expect(res).toStrictEqual(mockProvider);
  });

  it('should return the first provider if mustBeMetaMask is false', async () => {
    const mockProvider = { isMetaMask: false };
    (eip6963RequestProvider as jest.Mock).mockRejectedValue(
      new Error('Provider request failed'),
    );
    global.window = { ethereum: { providers: [mockProvider] } } as any;

    const res = await getBrowserExtension({
      mustBeMetaMask: false,
      sdkInstance,
    });

    expect(res).toStrictEqual(mockProvider);
  });

  it('should throw an error if mustBeMetaMask is true but MetaMask provider not found', async () => {
    (eip6963RequestProvider as jest.Mock).mockRejectedValue(
      new Error('Provider request failed'),
    );
    global.window = { ethereum: { isMetaMask: false } } as any;

    await expect(
      getBrowserExtension({ mustBeMetaMask: true, sdkInstance }),
    ).rejects.toThrow('MetaMask provider not found in Ethereum');
  });

  it('should throw an error if mustBeMetaMask is true but uniswap wallet installed instead of Metamask', async () => {
    (eip6963RequestProvider as jest.Mock).mockRejectedValue(
      new Error('Provider request failed'),
    );

    global.window = {
      ethereum: { isMetaMask: true, isUniswapWallet: true },
    } as any;

    await expect(
      getBrowserExtension({ mustBeMetaMask: true, sdkInstance }),
    ).rejects.toThrow('MetaMask provider not found in Ethereum');
  });

  it('should return ethereum object if mustBeMetaMask is false and ethereum object exists', async () => {
    const ethereumObj = { isMetaMask: true };
    (eip6963RequestProvider as jest.Mock).mockRejectedValue(
      new Error('Provider request failed'),
    );
    global.window = { ethereum: ethereumObj } as any;

    const res = await getBrowserExtension({
      mustBeMetaMask: false,
      sdkInstance,
    });

    expect(res).toStrictEqual(ethereumObj);
  });
});
