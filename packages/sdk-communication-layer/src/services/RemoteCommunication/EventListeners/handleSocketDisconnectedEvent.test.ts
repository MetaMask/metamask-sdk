import { RemoteCommunication } from '../../../RemoteCommunication';
import { handleSocketDisconnectedEvent } from './handleSocketDisconnectedEvent';

describe('handleSocketDisconnectedEvent', () => {
  let instance: RemoteCommunication;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        ready: true,
        debug: false,
      },
    } as unknown as RemoteCommunication;
  });

  it('should set the ready state to false upon socket disconnection', () => {
    const handler = handleSocketDisconnectedEvent(instance);
    handler();
    expect(instance.state.ready).toBe(false);
  });

  it('should log a debug message when debug is true', () => {
    instance.state.debug = true;
    const mockConsoleDebug = jest.spyOn(console, 'debug').mockImplementation();
    const handler = handleSocketDisconnectedEvent(instance);

    handler();

    expect(mockConsoleDebug).toHaveBeenCalledWith(
      `RemoteCommunication::on 'socket_Disconnected' set ready to false`,
    );
    mockConsoleDebug.mockRestore();
  });

  it('should not log a debug message when debug is false', () => {
    instance.state.debug = false;
    const mockConsoleDebug = jest.spyOn(console, 'debug').mockImplementation();
    const handler = handleSocketDisconnectedEvent(instance);
    handler();
    expect(mockConsoleDebug).not.toHaveBeenCalled();
    mockConsoleDebug.mockRestore();
  });
});
