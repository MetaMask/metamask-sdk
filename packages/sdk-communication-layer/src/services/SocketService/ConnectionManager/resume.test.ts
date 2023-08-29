/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';
import { resume } from './resume';

describe('resume', () => {
  let instance: SocketService;
  const mockConnect = jest.fn();
  const mockEmit = jest.fn();
  const mockSendMessage = jest.fn();
  const mockAreKeysExchanged = jest.fn();
  const mockStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
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
      sendMessage: mockSendMessage,
    } as unknown as SocketService;
  });

  it('should log debug information when debugging is enabled', () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;

    resume(instance);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      expect.stringContaining('SocketService::someContext::resume()'),
    );

    consoleDebugSpy.mockRestore();
  });

  it('should not connect socket if already connected', () => {
    instance.state.socket!.connected = true;

    resume(instance);

    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('should connect socket if not connected and emit JOIN_CHANNEL event', () => {
    resume(instance);

    expect(mockConnect).toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(
      EventType.JOIN_CHANNEL,
      'sampleChannelId',
      'someContext_resume',
    );
  });

  it('should send READY message if keys have been exchanged and not an originator', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);

    resume(instance);

    expect(mockSendMessage).toHaveBeenCalledWith({ type: MessageType.READY });
  });

  it('should not send READY message if an originator, but initiate key exchange', () => {
    instance.state.isOriginator = true;

    mockAreKeysExchanged.mockReturnValueOnce(true);

    resume(instance);

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('should start key exchange if keys are not exchanged and not an originator', () => {
    mockAreKeysExchanged.mockReturnValueOnce(false);

    resume(instance);

    expect(mockStart).toHaveBeenCalledWith({ isOriginator: false });
  });

  it('should update manualDisconnect and resumed state after resuming', () => {
    resume(instance);

    expect(instance.state.manualDisconnect).toBe(false);
    expect(instance.state.resumed).toBe(true);
  });
});
