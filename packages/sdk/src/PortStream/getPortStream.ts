import { PlatformType } from '@metamask/sdk-communication-layer';
import { Platform } from '../Platform/Platfform';
import { MobilePortStream } from './MobilePortStream';

export const getPortStream = () => {
  const platformType = Platform.getInstance().getPlatformType();

  if (platformType === PlatformType.MetaMaskMobileWebview) {
    return MobilePortStream;
  }

  return undefined;
};
