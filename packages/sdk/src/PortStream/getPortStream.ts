import { Platform } from '../Platform/Platfform';
import { PlatformType } from '../types/PlatformType';
import { MobilePortStream } from './MobilePortStream';

export const getPortStream = () => {
  const platformType = Platform.getInstance().getPlatformType();

  if (platformType === PlatformType.MetaMaskMobileWebview) {
    return MobilePortStream;
  }

  return undefined;
};
