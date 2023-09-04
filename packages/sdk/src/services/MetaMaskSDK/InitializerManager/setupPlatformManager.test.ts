import { PlatformManager } from '../../../Platform/PlatfformManager';
import { MetaMaskSDK } from '../../../sdk';
import { WakeLockStatus } from '../../../types/WakeLockStatus';

import { setupPlatformManager } from './setupPlatformManager';

jest.mock('../../../Platform/PlatfformManager', () => {
  return {
    PlatformManager: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe('setupPlatformManager', () => {
  let instance: MetaMaskSDK;

  beforeEach(() => {
    instance = {
      options: {},
      debug: false,
    } as unknown as MetaMaskSDK;
  });

  it('should initialize PlatformManager with default options when no options are provided', async () => {
    await setupPlatformManager(instance);

    expect(PlatformManager).toHaveBeenCalledWith({
      useDeepLink: false,
      preferredOpenLink: undefined,
      wakeLockStatus: undefined,
      debug: false,
    });
    expect(instance.platformManager).toBeDefined();
  });

  it('should initialize PlatformManager with user-defined options when provided', async () => {
    const fakeOptions = {
      useDeeplink: true,
      openDeeplink: jest.fn() as any,
      wakeLockType: WakeLockStatus.Disabled,
    } as MetaMaskSDK['options'];
    instance.options = fakeOptions;
    instance.debug = true;

    await setupPlatformManager(instance);

    expect(PlatformManager).toHaveBeenCalledWith({
      useDeepLink: fakeOptions.useDeeplink,
      preferredOpenLink: fakeOptions.openDeeplink,
      wakeLockStatus: fakeOptions.wakeLockType,
      debug: true,
    });
    expect(instance.platformManager).toBeDefined();
  });

  it('should set the initialized PlatformManager on the instance', async () => {
    await setupPlatformManager(instance);

    expect(instance.platformManager).toBeDefined();
  });
});
