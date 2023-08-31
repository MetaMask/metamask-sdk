import { PlatformType } from '@metamask/sdk-communication-layer';
import { getPortStream } from './getPortStream';
import { MobilePortStream } from './MobilePortStream';

describe('getPortStream', () => {
  it('should return MobilePortStream when platformType is MetaMaskMobileWebview', () => {
    const result = getPortStream(PlatformType.MetaMaskMobileWebview);
    expect(result).toBe(MobilePortStream);
  });

  it('should return undefined when platformType is not MetaMaskMobileWebview', () => {
    const result = getPortStream(PlatformType.DesktopWeb);
    expect(result).toBeUndefined();
  });
});
