import { RemoteCommunication } from '../../../RemoteCommunication';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { EventType } from '../../../types/EventType';
import { handleReadyMessage } from './handleReadyMessage';

describe('handleReadyMessage', () => {
  let instance: RemoteCommunication;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        paused: false,
        isOriginator: true,
        walletInfo: {},
      },
      setConnectionStatus: jest.fn(),
      emit: jest.fn(),
    } as unknown as RemoteCommunication;
  });

  it('should set the connection status to LINKED', () => {
    handleReadyMessage(instance);
    expect(instance.setConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.LINKED,
    );
  });

  it('should emit CLIENTS_READY event with correct data', () => {
    handleReadyMessage(instance);
    expect(instance.emit).toHaveBeenCalledWith(EventType.CLIENTS_READY, {
      isOriginator: instance.state.isOriginator,
      walletInfo: instance.state.walletInfo,
    });
  });

  it('should reset paused status to false', () => {
    instance.state.paused = true;
    handleReadyMessage(instance);
    expect(instance.state.paused).toBe(false);
  });

  it('should set authorized status and emit AUTHORIZED event on resumed connection', () => {
    instance.state.paused = true;
    handleReadyMessage(instance);
    expect(instance.state.authorized).toBe(true);
    expect(instance.emit).toHaveBeenCalledWith(EventType.AUTHORIZED);
  });

  it('should not set authorized status and not emit AUTHORIZED event when not paused', () => {
    instance.state.paused = false;
    handleReadyMessage(instance);
    expect(instance.state.authorized).not.toBe(true);
    expect(instance.emit).not.toHaveBeenCalledWith(EventType.AUTHORIZED);
  });

  it('should handle missing isOriginator or walletInfo state information', () => {
    instance.state.isOriginator = false;
    instance.state.walletInfo = undefined;
    handleReadyMessage(instance);
    expect(instance.emit).toHaveBeenCalledWith(EventType.CLIENTS_READY, {
      isOriginator: false,
      walletInfo: undefined,
    });
  });
});
