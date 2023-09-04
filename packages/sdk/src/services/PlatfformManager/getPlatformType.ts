import { PlatformType } from '@metamask/sdk-communication-layer';
import { PlatformManager } from '../../Platform/PlatfformManager';

export function getPlatformType(instance: PlatformManager) {
  const { state } = instance;

  if (state.platformType) {
    return state.platformType;
  }

  if (instance.isReactNative()) {
    return PlatformType.ReactNative;
  }

  if (instance.isNotBrowser()) {
    return PlatformType.NonBrowser;
  }

  if (instance.isMetaMaskMobileWebView()) {
    return PlatformType.MetaMaskMobileWebview;
  }

  if (instance.isMobile()) {
    return PlatformType.MobileWeb;
  }

  return PlatformType.DesktopWeb;
}
