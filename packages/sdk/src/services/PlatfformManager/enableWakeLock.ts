import {
  PlatformManager,
  TEMPORARY_WAKE_LOCK_TIME,
  UNTIL_RESPONSE_WAKE_LOCK_TIME,
} from '../../Platform/PlatfformManager';
import { WakeLockStatus } from '../../types/WakeLockStatus';

export function enableWakeLock(instance: PlatformManager) {
  const { state } = instance;

  if (state.wakeLockStatus === WakeLockStatus.Disabled) {
    return;
  }

  state.wakeLock.enable();

  const maxTime =
    state.wakeLockStatus === WakeLockStatus.Temporary
      ? TEMPORARY_WAKE_LOCK_TIME
      : UNTIL_RESPONSE_WAKE_LOCK_TIME;

  // At the most wake lock a maximum of time
  state.wakeLockTimer = setTimeout(() => {
    instance.disableWakeLock();
  }, maxTime) as unknown as NodeJS.Timeout;

  if (
    !state.wakeLockFeatureActive &&
    state.wakeLockStatus === WakeLockStatus.UntilResponse
  ) {
    state.wakeLockFeatureActive = true;
    window.addEventListener('focus', () => instance.disableWakeLock());
  }
}
