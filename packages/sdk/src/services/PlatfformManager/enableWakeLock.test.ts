import {
  PlatformManager,
  TEMPORARY_WAKE_LOCK_TIME,
  UNTIL_RESPONSE_WAKE_LOCK_TIME,
} from '../../Platform/PlatfformManager';
import { WakeLockStatus } from '../../types/WakeLockStatus';
import { enableWakeLock } from './enableWakeLock';

jest.useFakeTimers();

describe('enableWakeLock', () => {
  let instance: jest.Mocked<PlatformManager>;

  const mockAddEventListener = jest.fn();
  const mockClearTimeout = jest.fn();
  const spySetTimeout = jest.spyOn(global, 'setTimeout');

  beforeEach(() => {
    instance = {
      disableWakeLock: jest.fn(),
      state: {
        wakeLockStatus: WakeLockStatus.Temporary,
        wakeLockTimer: null,
        wakeLockFeatureActive: false,
        wakeLock: {
          enable: jest.fn().mockReturnValue(Promise.resolve()),
        },
      },
    } as unknown as jest.Mocked<PlatformManager>;

    global.window = {
      addEventListener: mockAddEventListener,
    } as any;

    global.clearTimeout = mockClearTimeout;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should do nothing if wakeLockStatus is Disabled', () => {
    instance.state.wakeLockStatus = WakeLockStatus.Disabled;

    enableWakeLock(instance);

    expect(instance.state.wakeLock.enable).not.toHaveBeenCalled();
    expect(spySetTimeout).not.toHaveBeenCalled();
  });

  it('should call enable method of wakeLock object in the state', () => {
    enableWakeLock(instance);

    expect(instance.state.wakeLock.enable).toHaveBeenCalled();
  });

  it('should set the wakeLockTimer based on wakeLockStatus', () => {
    instance.state.wakeLockStatus = WakeLockStatus.Temporary;
    enableWakeLock(instance);

    expect(spySetTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      TEMPORARY_WAKE_LOCK_TIME,
    );

    jest.clearAllMocks();

    instance.state.wakeLockStatus = WakeLockStatus.UntilResponse;
    enableWakeLock(instance);

    expect(spySetTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      UNTIL_RESPONSE_WAKE_LOCK_TIME,
    );
  });

  it('should set wakeLockFeatureActive to true and add a focus event listener to window if wakeLockStatus is UntilResponse', () => {
    instance.state.wakeLockStatus = WakeLockStatus.UntilResponse;
    instance.state.wakeLockFeatureActive = false;

    enableWakeLock(instance);

    expect(instance.state.wakeLockFeatureActive).toBe(true);
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'focus',
      expect.any(Function),
    );
  });
});
