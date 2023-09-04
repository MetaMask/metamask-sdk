import { getBrowserExtension } from './get-browser-extension';

describe('getBrowserExtension', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if window is undefined', () => {
    global.window = undefined as any;

    expect(() => getBrowserExtension({ mustBeMetaMask: true })).toThrow(
      'window not available',
    );
  });

  it('should throw an error if ethereum is not found in window object', () => {
    global.window = {} as any;

    expect(() => getBrowserExtension({ mustBeMetaMask: true })).toThrow(
      'Ethereum not found in window object',
    );
  });

  it('should throw an error if no suitable provider is found', () => {
    global.window = { ethereum: { providers: [] } } as any;

    expect(() => getBrowserExtension({ mustBeMetaMask: true })).toThrow(
      'No suitable provider found',
    );
  });

  it('should return MetaMask provider if mustBeMetaMask is true', () => {
    const mockProvider = { isMetaMask: true };
    global.window = { ethereum: { providers: [mockProvider] } } as any;

    expect(getBrowserExtension({ mustBeMetaMask: true })).toStrictEqual(
      mockProvider,
    );
  });

  it('should return the first provider if mustBeMetaMask is false', () => {
    const mockProvider = { isMetaMask: false };
    global.window = { ethereum: { providers: [mockProvider] } } as any;

    expect(getBrowserExtension({ mustBeMetaMask: false })).toStrictEqual(
      mockProvider,
    );
  });

  it('should throw an error if mustBeMetaMask is true but MetaMask provider not found', () => {
    global.window = { ethereum: { isMetaMask: false } } as any;

    expect(() => getBrowserExtension({ mustBeMetaMask: true })).toThrow(
      'MetaMask provider not found in Ethereum',
    );
  });

  it('should return ethereum object if mustBeMetaMask is false and ethereum object exists', () => {
    const ethereumObj = { isMetaMask: true };
    global.window = { ethereum: ethereumObj } as any;

    expect(getBrowserExtension({ mustBeMetaMask: false })).toStrictEqual(
      ethereumObj,
    );
  });
});
