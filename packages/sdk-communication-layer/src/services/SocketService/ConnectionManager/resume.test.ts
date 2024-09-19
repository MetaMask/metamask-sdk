import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
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
      remote: { state: {}, hasRelayPersistence: jest.fn() },
      sendMessage: mockSendMessage,
    } as unknown as SocketService;
  });

  it('should log debug information', async () => {
    await resume(instance);

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should not connect socket if already connected', async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    instance.state.socket!.connected = true;

    await resume(instance);

    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('should connect socket if not connected and emit JOIN_CHANNEL event', async () => {
    await resume(instance);

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

  it('should send READY message if keys have been exchanged and not an originator', async () => {
    mockAreKeysExchanged.mockReturnValue(true);

    await resume(instance);

    expect(mockEmit).toHaveBeenCalled();
  });

  it('should update manualDisconnect and resumed state after resuming', async () => {
    await resume(instance);

    expect(instance.state.manualDisconnect).toBe(false);
    expect(instance.state.resumed).toBe(true);
  });
});
