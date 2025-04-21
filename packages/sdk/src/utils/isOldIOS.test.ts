import { isOldIOS } from './isOldIOS';

describe('isOldIOS', () => {
  const originalNavigator = Object.getOwnPropertyDescriptor(
    global,
    'navigator',
  );
  const originalWindow = Object.getOwnPropertyDescriptor(global, 'window');

  afterEach(() => {
    // Restore original properties after each test
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', originalNavigator);
    } else {
      // @ts-expect-error - Deleting property for cleanup
      delete global.navigator;
    }

    if (originalWindow) {
      Object.defineProperty(global, 'window', originalWindow);
    } else {
      // @ts-expect-error - Deleting property for cleanup
      delete global.window;
    }
  });

  it('should return true for iOS versions less than 10', () => {
    const userAgent = 'CPU iPhone OS 9_3 like Mac OS X';

    Object.defineProperty(global, 'navigator', {
      value: { userAgent },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'window', {
      value: { MSStream: undefined },
      writable: true,
      configurable: true,
    });

    expect(isOldIOS()).toBe(true);
  });

  it('should return false for iOS versions 10 or greater', () => {
    const userAgent = 'CPU iPhone OS 10_0 like Mac OS X';

    Object.defineProperty(global, 'navigator', {
      value: { userAgent },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'window', {
      value: { MSStream: undefined },
      writable: true,
      configurable: true,
    });

    expect(isOldIOS()).toBe(false);
  });

  it('should return false for non-iOS user agents', () => {
    const userAgent = 'Android';

    Object.defineProperty(global, 'navigator', {
      value: { userAgent },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'window', {
      value: { MSStream: undefined },
      writable: true,
      configurable: true,
    });

    expect(isOldIOS()).toBe(false);
  });

  it('should return false if MSStream is defined', () => {
    const userAgent = 'CPU iPhone OS 9_3 like Mac OS X';

    Object.defineProperty(global, 'navigator', {
      value: { userAgent },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'window', {
      value: { MSStream: {} },
      writable: true,
      configurable: true,
    });

    expect(isOldIOS()).toBe(false);
  });
});
