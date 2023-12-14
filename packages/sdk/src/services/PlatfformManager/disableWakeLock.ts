import { PlatformManager } from '../../Platform/PlatfformManager';
import { WakeLockStatus } from '../../types/WakeLockStatus';

export function disableWakeLock(instance: PlatformManager) {
  const { state } = instance;

  if (state.wakeLockStatus === WakeLockStatus.Disabled) {
    return;
  }

  if (state.wakeLockTimer) {
    clearTimeout(state.wakeLockTimer as NodeJS.Timeout);
  }

  state.wakeLock.disable('disableWakeLock');
}
