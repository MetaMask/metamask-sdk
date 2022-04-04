import Platform, { PlatformName } from '../Platform';
import MobilePortStream from './MobilePortStream';

const getPortStreamToUse = () => {
  const platform = Platform.getPlatform();

  if (platform === PlatformName.MetaMaskMobileWebview) return MobilePortStream;

  return false;
};

const PortStreams = {
  portStream: null,
  getPortStreamToUse() {
    if (this.portStream) return this.portStream;

    this.portStream = getPortStreamToUse();
    return this.portStream;
  },
};

export default PortStreams;
