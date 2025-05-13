import { analytics } from '@metamask/sdk-analytics';
import { MetaMaskSDK } from '../../../sdk';
import { setupAnalyticsV2 } from './setupAnalyticsV2';

jest.mock('@metamask/sdk-analytics', () => ({
  analytics: {
    setGlobalProperty: jest.fn(),
    enable: jest.fn(),
    track: jest.fn(),
  },
}));

describe('setupAnalyticsV2', () => {
  let mockInstance: MetaMaskSDK;
  const mockVersion = '1.0.0';
  const mockDappId = 'test-dapp-id';
  const mockAnonId = 'test-anon-id';
  const mockPlatform = 'browser';
  const mockIntegrationType = 'test-integration';

  beforeEach(() => {
    jest.clearAllMocks();

    mockInstance = {
      options: {
        enableAnalytics: true,
        _source: mockIntegrationType,
      },
      platformManager: {
        isBrowser: jest.fn().mockReturnValue(true),
        isReactNative: jest.fn().mockReturnValue(false),
        getPlatformType: jest.fn().mockReturnValue(mockPlatform),
      },
      getVersion: jest.fn().mockReturnValue(mockVersion),
      getDappId: jest.fn().mockReturnValue(mockDappId),
      getAnonId: jest.fn().mockResolvedValue(mockAnonId),
    } as unknown as MetaMaskSDK;
  });

  it('should not setup analytics when enableAnalytics is false', async () => {
    mockInstance.options.enableAnalytics = false;

    await setupAnalyticsV2(mockInstance);

    expect(analytics.setGlobalProperty).not.toHaveBeenCalled();
    expect(analytics.enable).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('should not setup analytics when platform is not browser or react native', async () => {
    jest
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .spyOn(mockInstance.platformManager!, 'isBrowser')
      .mockReturnValue(false);

    jest
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .spyOn(mockInstance.platformManager!, 'isReactNative')
      .mockImplementation()
      .mockReturnValue(false);

    await setupAnalyticsV2(mockInstance);

    expect(analytics.setGlobalProperty).not.toHaveBeenCalled();
    expect(analytics.enable).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('should setup analytics with correct global properties when running in browser', async () => {
    await setupAnalyticsV2(mockInstance);

    expect(analytics.setGlobalProperty).toHaveBeenCalledWith(
      'sdk_version',
      mockVersion,
    );

    expect(analytics.setGlobalProperty).toHaveBeenCalledWith(
      'dapp_id',
      mockDappId,
    );

    expect(analytics.setGlobalProperty).toHaveBeenCalledWith(
      'anon_id',
      mockAnonId,
    );

    expect(analytics.setGlobalProperty).toHaveBeenCalledWith(
      'platform',
      mockPlatform,
    );

    expect(analytics.setGlobalProperty).toHaveBeenCalledWith(
      'integration_type',
      mockIntegrationType,
    );
    expect(analytics.enable).toHaveBeenCalled();
    expect(analytics.track).toHaveBeenCalledWith('sdk_initialized', {});
  });

  it('should setup analytics when running in react native', async () => {
    jest
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .spyOn(mockInstance.platformManager!, 'isBrowser')
      .mockImplementation()
      .mockReturnValue(false);

    jest
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .spyOn(mockInstance.platformManager!, 'isReactNative')
      .mockImplementation()
      .mockReturnValue(true);

    await setupAnalyticsV2(mockInstance);

    expect(analytics.enable).toHaveBeenCalled();
    expect(analytics.track).toHaveBeenCalledWith('sdk_initialized', {});
  });
});
