import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';
import { resume } from './resume';

jest.mock('./handleJoinChannelResult', () => ({
  handleJoinChannelResults: jest.fn(),
}));

describe('resume', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const mockConnect = jest.fn();
  const mockEmit = jest.fn();
  const mockSendMessage = jest.fn();
  const mockAreKeysExchanged = jest.fn();
  const mockStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        context: 'someContext',
        isOriginator: false,
        channelId: 'sampleChannelId',
        socket: {
          connected: false,
          connect: mockConnect,
          emit: mockEmit,
        },
        keyExchange: {
          areKeysExchanged: mockAreKeysExchanged,
          start: mockStart,
        },
      },
      remote: { state: {} },
      sendMessage: mockSendMessage,
    } as unknown as SocketService;
  });

  it('should log debug information', () => {
    resume(instance);

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should not connect socket if already connected', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    instance.state.socket!.connected = true;

    resume(instance);

    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('should connect socket if not connected and emit JOIN_CHANNEL event', () => {
    resume(instance);

    expect(mockConnect).toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(
      EventType.JOIN_CHANNEL,
      {
        channelId: 'sampleChannelId',
        clientType: 'wallet',
        context: 'someContext_resume',
      },
      expect.any(Function),
    );
  });

  it('should send READY message if keys have been exchanged and not an originator', () => {
    mockAreKeysExchanged.mockReturnValue(true);

    resume(instance);

    expect(mockSendMessage).toHaveBeenCalledWith({ type: MessageType.READY });
  });

  it('should not send READY message if an originator, but initiate key exchange', () => {
    instance.state.isOriginator = true;

    mockAreKeysExchanged.mockReturnValue(true);

    resume(instance);

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('should start key exchange if keys are not exchanged and not an originator', () => {
    mockAreKeysExchanged.mockReturnValue(false);

    resume(instance);

    expect(mockStart).toHaveBeenCalledWith({ isOriginator: false });
  });

  it('should update manualDisconnect and resumed state after resuming', () => {
    resume(instance);

    expect(instance.state.manualDisconnect).toBe(false);
    expect(instance.state.resumed).toBe(true);
  });
});
