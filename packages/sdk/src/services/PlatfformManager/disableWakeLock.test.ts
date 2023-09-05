import { PlatformManager } from '../../Platform/PlatfformManager';
import { WakeLockStatus } from '../../types/WakeLockStatus';
import { disableWakeLock } from './disableWakeLock';

jest.useFakeTimers();

describe('disableWakeLock', () => {
  let instance: jest.Mocked<PlatformManager>;

  const mockClearTimeout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        wakeLockStatus: WakeLockStatus.Temporary,
        wakeLockTimer: null,
        wakeLock: {
          disable: jest.fn(),
        },
      },
    } as unknown as jest.Mocked<PlatformManager>;

    global.clearTimeout = mockClearTimeout;
  });

  it('should do nothing if wakeLockStatus is already Disabled', () => {
    instance.state.wakeLockStatus = WakeLockStatus.Disabled;

    disableWakeLock(instance);

    expect(mockClearTimeout).not.toHaveBeenCalled();
    expect(instance.state.wakeLock.disable).not.toHaveBeenCalled();
  });

  it('should clear the wakeLockTimer if it exists', () => {
    const mockTimer = setTimeout(() => {
      // do nothing
    }, 1000) as unknown as NodeJS.Timeout;
    instance.state.wakeLockTimer = mockTimer;

    disableWakeLock(instance);

    expect(clearTimeout).toHaveBeenCalledWith(mockTimer);
  });

  it('should call disable method of wakeLock object in the state', () => {
    disableWakeLock(instance);

    expect(instance.state.wakeLock.disable).toHaveBeenCalled();
  });
});
