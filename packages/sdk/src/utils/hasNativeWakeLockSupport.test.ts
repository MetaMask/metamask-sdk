import { hasNativeWakeLock } from './hasNativeWakeLockSupport';

describe('hasNativeWakeLock', () => {
  it('should return true if wakeLock is in navigator', () => {
    global.navigator = { wakeLock: {} } as any;
    expect(hasNativeWakeLock()).toBe(true);
  });

  it('should return false if wakeLock is not in navigator', () => {
    global.navigator = {} as any;
    expect(hasNativeWakeLock()).toBe(false);
  });
});
