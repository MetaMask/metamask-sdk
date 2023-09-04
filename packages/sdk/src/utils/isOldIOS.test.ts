import { isOldIOS } from './isOldIOS';

describe('isOldIOS', () => {
  it('should return true for iOS versions less than 10', () => {
    const userAgent = 'CPU iPhone OS 9_3 like Mac OS X';
    global.navigator = { userAgent } as any;
    global.window = { MSStream: undefined } as any;

    expect(isOldIOS()).toBe(true);
  });

  it('should return false for iOS versions 10 or greater', () => {
    const userAgent = 'CPU iPhone OS 10_0 like Mac OS X';
    global.navigator = { userAgent } as any;
    global.window = { MSStream: undefined } as any;

    expect(isOldIOS()).toBe(false);
  });

  it('should return false for non-iOS user agents', () => {
    const userAgent = 'Android';
    global.navigator = { userAgent } as any;
    global.window = { MSStream: undefined } as any;

    expect(isOldIOS()).toBe(false);
  });

  it('should return false if MSStream is defined', () => {
    const userAgent = 'CPU iPhone OS 9_3 like Mac OS X';
    global.navigator = { userAgent } as any;
    global.window = { MSStream: {} } as any;

    expect(isOldIOS()).toBe(false);
  });
});
