import { RemoteCommunication } from '../../../RemoteCommunication';
import * as loggerModule from '../../../utils/logger';
import { handleSocketDisconnectedEvent } from './handleSocketDisconnectedEvent';

describe('handleSocketDisconnectedEvent', () => {
  let instance: RemoteCommunication;

  const spyLogger = jest.spyOn(loggerModule, 'loggerRemoteLayer');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        ready: true,
      },
    } as unknown as RemoteCommunication;
  });

  it('should set the ready state to false upon socket disconnection', () => {
    const handler = handleSocketDisconnectedEvent(instance);
    handler();
    expect(instance.state.ready).toBe(false);
  });

  it('should log a debug message when debug is true', () => {
    const handler = handleSocketDisconnectedEvent(instance);

    handler();

    expect(spyLogger).toHaveBeenCalledWith(
      "[RemoteCommunication: handleSocketDisconnectedEvent()] on 'socket_Disconnected' set ready to false",
    );
  });
});
