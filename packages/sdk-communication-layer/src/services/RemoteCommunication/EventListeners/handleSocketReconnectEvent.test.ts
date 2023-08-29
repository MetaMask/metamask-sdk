import { RemoteCommunication } from '../../../RemoteCommunication';
import { clean } from '../ChannelManager';
import { handleSocketReconnectEvent } from './handleSocketReconnectEvent';

jest.mock('../ChannelManager');

describe('handleSocketReconnectEvent', () => {
  let instance: RemoteCommunication;
  const mockClean = clean as jest.MockedFunction<typeof clean>;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        ready: true,
        debug: false,
      },
    } as unknown as RemoteCommunication;
  });

  it('should set the ready state to false upon socket reconnection', () => {
    const handler = handleSocketReconnectEvent(instance);
    handler();
    expect(instance.state.ready).toBe(false);
  });

  it('should call the clean function from ChannelManager', () => {
    const handler = handleSocketReconnectEvent(instance);
    handler();
    expect(mockClean).toHaveBeenCalledWith(instance.state);
  });

  it('should log a debug message when debug is true', () => {
    instance.state.debug = true;
    const mockConsoleDebug = jest.spyOn(console, 'debug').mockImplementation();
    const handler = handleSocketReconnectEvent(instance);
    handler();
    expect(mockConsoleDebug).toHaveBeenCalledWith(
      `RemoteCommunication::on 'socket_reconnect' -- reset key exchange status / set ready to false`,
    );
    mockConsoleDebug.mockRestore();
  });
});
