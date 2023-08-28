import { RemoteCommunication } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import { disconnect } from '../ConnectionManager';
import { handleTerminateMessage } from './handleTerminateMessage';

jest.mock('../ConnectionManager', () => {
  return {
    disconnect: jest.fn(),
  };
});

describe('handleTerminateMessage', () => {
  let instance: RemoteCommunication;
  const mockDisconnect = disconnect as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        isOriginator: false,
      },
      emit: jest.fn(),
    } as unknown as RemoteCommunication;
  });

  it('should not terminate if the instance is not the originator', () => {
    handleTerminateMessage(instance);
    expect(mockDisconnect).not.toHaveBeenCalled();
    expect(instance.emit).not.toHaveBeenCalledWith(EventType.TERMINATE);
  });

  it('should terminate the communication channel if the instance is the originator', () => {
    instance.state.isOriginator = true;

    handleTerminateMessage(instance);

    expect(mockDisconnect).toHaveBeenCalledWith({
      options: { terminate: true, sendMessage: false },
      instance,
    });
    expect(instance.emit).toHaveBeenCalledWith(EventType.TERMINATE);
  });

  it('should output a debug message during termination', () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

    instance.state.isOriginator = true;
    handleTerminateMessage(instance);

    expect(consoleDebugSpy).toHaveBeenCalled();

    consoleDebugSpy.mockRestore();
  });
});
