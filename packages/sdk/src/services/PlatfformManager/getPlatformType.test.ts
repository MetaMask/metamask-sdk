import { PlatformType } from '@metamask/sdk-communication-layer';
import { PlatformManager } from '../../Platform/PlatfformManager'; // Fix the typo if it exists
import { getPlatformType } from './getPlatformType';

describe('getPlatformType', () => {
  let instance: jest.Mocked<PlatformManager>;

  beforeEach(() => {
    instance = {
      state: {
        platformType: null,
      },
      isReactNative: jest.fn(),
      isNotBrowser: jest.fn(),
      isMetaMaskMobileWebView: jest.fn(),
      isMobile: jest.fn(),
    } as unknown as jest.Mocked<PlatformManager>;
  });

  it('should return platformType from state if it exists', () => {
    instance.state.platformType = PlatformType.DesktopWeb;

    expect(getPlatformType(instance)).toBe(PlatformType.DesktopWeb);
  });

  it('should return PlatformType.ReactNative if isReactNative is true', () => {
    instance.isReactNative.mockReturnValue(true);

    expect(getPlatformType(instance)).toBe(PlatformType.ReactNative);
  });

  it('should return PlatformType.NonBrowser if isNotBrowser is true', () => {
    instance.isNotBrowser.mockReturnValue(true);

    expect(getPlatformType(instance)).toBe(PlatformType.NonBrowser);
  });

  it('should return PlatformType.MetaMaskMobileWebview if isMetaMaskMobileWebView is true', () => {
    instance.isMetaMaskMobileWebView.mockReturnValue(true);

    expect(getPlatformType(instance)).toBe(PlatformType.MetaMaskMobileWebview);
  });

  it('should return PlatformType.MobileWeb if isMobile is true', () => {
    instance.isMobile.mockReturnValue(true);

    expect(getPlatformType(instance)).toBe(PlatformType.MobileWeb);
  });

  it('should return PlatformType.DesktopWeb if no conditions are met', () => {
    expect(getPlatformType(instance)).toBe(PlatformType.DesktopWeb);
  });
});
