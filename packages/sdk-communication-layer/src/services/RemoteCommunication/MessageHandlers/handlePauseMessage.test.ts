import { RemoteCommunication } from '../../../RemoteCommunication';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { handlePauseMessage } from './handlePauseMessage';

describe('handlePauseMessage', () => {
  let instance: RemoteCommunication;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        paused: false,
      },
      setConnectionStatus: jest.fn(),
    } as unknown as RemoteCommunication;
  });

  it('should set the communication as paused', () => {
    handlePauseMessage(instance);
    expect(instance.state.paused).toBe(true);
  });

  it('should update the connection status to PAUSED', () => {
    handlePauseMessage(instance);
    expect(instance.setConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.PAUSED,
    );
  });
});
