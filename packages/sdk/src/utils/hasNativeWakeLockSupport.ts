// Detect native Wake Lock API support
export const hasNativeWakeLock = () => 'wakeLock' in navigator;
