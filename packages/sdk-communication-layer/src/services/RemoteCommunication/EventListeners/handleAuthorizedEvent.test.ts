import { RemoteCommunication } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import { PlatformType } from '../../../types/PlatformType';
import { WalletInfo } from '../../../types/WalletInfo';
import { wait } from '../../../utils/wait';
import { handleAuthorizedEvent } from './handleAuthorizedEvent';

jest.mock('../../../utils/wait');

describe('handleAuthorizedEvent', () => {
  let instance: RemoteCommunication;
  const mockEmit = jest.fn();

  jest.spyOn(console, 'debug').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: true,
        platformType: PlatformType.MobileWeb,
        channelId: 'testChannel',
        walletInfo: {
          version: '7.2',
        },
      },
      emit: mockEmit,
    } as unknown as RemoteCommunication;

    (wait as jest.MockedFunction<typeof wait>).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should skip if already authorized', async () => {
    instance.state.authorized = true;
    const handler = handleAuthorizedEvent(instance);
    await handler();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('should wait for wallet version if not available', async () => {
    instance.state.walletInfo = undefined;
    const handler = handleAuthorizedEvent(instance);
    const promise = handler();
    expect(wait).toHaveBeenCalled();
    instance.state.walletInfo = { version: '7.2' } as WalletInfo;
    await promise;
  });

  it('should not handle the authorized event for wallet version 7.3+', async () => {
    instance.state.walletInfo = { version: '7.3' } as WalletInfo;
    const handler = handleAuthorizedEvent(instance);
    await handler();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('should emit AUTHORIZED event for secure platform and wallet version less than 7.3', async () => {
    instance.state.walletInfo = { version: '7.2' } as WalletInfo;
    const handler = handleAuthorizedEvent(instance);
    await handler();
    expect(mockEmit).toHaveBeenCalledWith(EventType.AUTHORIZED);
  });

  it('should not emit AUTHORIZED event for insecure platform', async () => {
    instance.state.platformType = PlatformType.DesktopWeb;
    instance.state.walletInfo = { version: '7.2' } as WalletInfo;
    const handler = handleAuthorizedEvent(instance);
    await handler();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('should skip processing for wallet version 7.3', async () => {
    instance.state.walletInfo = { version: '7.3' } as WalletInfo;

    const handler = handleAuthorizedEvent(instance);
    await handler();

    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('should emit AUTHORIZED event for ReactNative platform', async () => {
    instance.state.platformType = PlatformType.ReactNative;

    const handler = handleAuthorizedEvent(instance);
    await handler();

    expect(mockEmit).toHaveBeenCalledWith(EventType.AUTHORIZED);
  });

  it('should emit AUTHORIZED event for MetaMaskMobileWebview platform', async () => {
    instance.state.platformType = PlatformType.MetaMaskMobileWebview;

    const handler = handleAuthorizedEvent(instance);
    await handler();

    expect(mockEmit).toHaveBeenCalledWith(EventType.AUTHORIZED);
  });
});
