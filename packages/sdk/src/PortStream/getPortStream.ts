import { PlatformType } from '@metamask/sdk-communication-layer';
import { MobilePortStream } from './MobilePortStream';

export const getPortStream = (platformType: PlatformType) => {
  if (platformType === PlatformType.MetaMaskMobileWebview) {
    return MobilePortStream;
  }

  return undefined;
};
