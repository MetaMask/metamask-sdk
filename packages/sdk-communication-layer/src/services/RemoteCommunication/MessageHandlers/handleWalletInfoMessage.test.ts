import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { handleWalletInfoMessage } from './handleWalletInfoMessage';

describe('handleWalletInfoMessage', () => {
  let instance: RemoteCommunication;
  let message: CommunicationLayerMessage;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        walletInfo: null,
        paused: true,
      },
    } as unknown as RemoteCommunication;

    message = {
      walletInfo: {
        version: '7.0',
      },
    } as unknown as CommunicationLayerMessage;
  });

  it('should update the walletInfo in the instance state', () => {
    handleWalletInfoMessage(instance, message);
    expect(instance.state.walletInfo).toBe(message.walletInfo);
  });

  it('should set the paused status to false', () => {
    handleWalletInfoMessage(instance, message);
    expect(instance.state.paused).toBe(false);
  });
});
