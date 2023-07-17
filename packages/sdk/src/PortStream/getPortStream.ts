import { PlatformType } from '@metamask/sdk-communication-layer';
import { PlatformManager } from '../Platform/PlatfformManager';
import { MobilePortStream } from './MobilePortStream';

export const getPortStream = () => {
  const platformType = PlatformManager.getInstance().getPlatformType();

  if (platformType === PlatformType.MetaMaskMobileWebview) {
    return MobilePortStream;
  }

  return undefined;
};
