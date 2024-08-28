import { SocketService } from '../../../SocketService';
import { setupSocketFocusListener } from './setupSocketFocusListener';
import { reconnectSocket } from './reconnectSocket';

jest.mock('./reconnectSocket');
jest.mock('../../../utils/logger', () => ({
  logger: { SocketService: jest.fn() },
}));

describe('setupSocketFocusListener', () => {
  let instance: SocketService;
  let mockAddEventListener: jest.Mock;

  beforeEach(() => {
    instance = { state: {} } as SocketService;
    mockAddEventListener = jest.fn();
    (global as any).window = { addEventListener: mockAddEventListener };
    (global as any).document = {
      hasFocus: jest.fn(),
    };
    (reconnectSocket as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (global as any).window;
    delete (global as any).document;
  });

  it('should set up a focus event listener', () => {
    jest.spyOn(document, 'hasFocus').mockImplementation().mockReturnValue(true);

    setupSocketFocusListener(instance);

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'focus',
      expect.any(Function),
    );
  });

  it('should attempt reconnection when focus event is triggered', async () => {
    jest
      .spyOn(document, 'hasFocus')
      .mockImplementation()
      .mockReturnValue(false);

    setupSocketFocusListener(instance);

    const focusCallback = mockAddEventListener.mock.calls[0][1];
    await focusCallback();

    expect(reconnectSocket).toHaveBeenCalledWith(instance);
  });

  it('should handle errors when reconnection fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (reconnectSocket as jest.Mock).mockRejectedValue(
      new Error('Reconnection failed'),
    );

    jest
      .spyOn(document, 'hasFocus')
      .mockImplementation()
      .mockReturnValue(false);

    setupSocketFocusListener(instance);

    const focusCallback = mockAddEventListener.mock.calls[0][1];
    await focusCallback();

    expect(reconnectSocket).toHaveBeenCalledWith(instance);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'setupSocketFocusListeners Error reconnecting socket',
      new Error('Reconnection failed'),
    );

    consoleErrorSpy.mockRestore();
  });

  it('should not run if window or document are undefined', () => {
    delete (global as any).window;
    delete (global as any).document;

    setupSocketFocusListener(instance);

    expect(mockAddEventListener).not.toHaveBeenCalled();
  });
});
