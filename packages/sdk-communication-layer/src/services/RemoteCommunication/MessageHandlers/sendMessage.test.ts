import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';
import { handleAuthorization } from '../ConnectionManager';
import { sendMessage } from './sendMessage';

jest.mock('../ConnectionManager');

describe('sendMessage', () => {
  let instance: RemoteCommunication;
  let message: CommunicationLayerMessage;

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

  it('should log if debug mode is enabled', async () => {
    instance.state.debug = true;
    const consoleLogSpy = jest.spyOn(console, 'log');
    await sendMessage(instance, message);
    expect(consoleLogSpy).toHaveBeenCalled();
    consoleLogSpy.mockRestore();
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
