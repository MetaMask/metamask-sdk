import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';
import { handleAuthorization } from '../ConnectionManager';
import * as loggerModule from '../../../utils/logger';
import { sendMessage } from './sendMessage';

jest.mock('../ConnectionManager');

describe('sendMessage', () => {
  let instance: RemoteCommunication;
  let message: CommunicationLayerMessage;

  const spyLogger = jest.spyOn(loggerModule, 'loggerRemoteLayer');
  const mockHandleAuthorization = handleAuthorization as jest.Mock;
  const mockOnce = jest.fn(
    (_: EventType, callback: (data: unknown) => void) => {
      callback({});
    },
  );
  const mockEmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        paused: false,
        ready: true,
        authorized: true,
        communicationLayer: {
          isConnected: jest.fn().mockReturnValue(true),
        },
        clientsConnected: true,
        _connectionStatus: 'connected',
        context: 'test-context',
      },
      once: mockOnce,
      emit: mockEmit,
    } as unknown as RemoteCommunication;

    message = {
      type: MessageType.PING,
    } as unknown as CommunicationLayerMessage;
  });

  it('should log debug info', async () => {
    await sendMessage(instance, message);

    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: sendMessage()] context=test-context paused=false ready=true authorized=true socket=true clientsConnected=true status=connected',
      message,
    );
  });

  it('should wait for CLIENTS_READY event if conditions are not favorable', async () => {
    instance.state.ready = false;
    await sendMessage(instance, message);
    expect(instance.once).toHaveBeenCalledWith(
      EventType.CLIENTS_READY,
      expect.any(Function),
    );
  });

  it('should not wait for CLIENTS_READY event if conditions are favorable', async () => {
    await sendMessage(instance, message);
    expect(instance.once).not.toHaveBeenCalledWith(
      EventType.CLIENTS_READY,
      expect.any(Function),
    );
  });

  it('should handle authorization errors correctly', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');
    const mockError = new Error('Authorization Error');
    mockHandleAuthorization.mockRejectedValueOnce(mockError);

    await expect(sendMessage(instance, message)).rejects.toThrow(mockError);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
