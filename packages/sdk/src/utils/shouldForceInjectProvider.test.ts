import { shouldForceInjectProvider } from './shouldForceInjectProvider';

describe('shouldForceInjectProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if forceInjectProvider is true', () => {
    expect(shouldForceInjectProvider(true)).toBe(true);
  });

  it('should return true if forceInjectProvider is false but window.navigator.brave is true', () => {
    global.window = { navigator: { brave: true } } as any;

    expect(shouldForceInjectProvider(false)).toBe(true);
  });

  it('should return false if forceInjectProvider is false and window.navigator.brave is false', () => {
    global.window = { navigator: { brave: false } } as any;

    expect(shouldForceInjectProvider(false)).toBe(false);
  });

  it('should return undefined if forceInjectProvider is false and window.navigator.brave is undefined', () => {
    global.window = {
      navigator: {
        brave: undefined,
      },
    } as any;

    expect(shouldForceInjectProvider(false)).toBeUndefined();
  });
});
