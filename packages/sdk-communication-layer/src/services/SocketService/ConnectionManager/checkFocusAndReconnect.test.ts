import { SocketService } from '../../../SocketService';
import { checkFocusAndReconnect } from './checkFocusAndReconnect';
import { reconnectSocket } from './reconnectSocket';

jest.mock('./reconnectSocket');

const mockHasFocus = jest.fn();
const mockAddEventListener = jest.fn();

describe('checkFocusAndReconnect', () => {
  let instance: SocketService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockHasFocus.mockReturnValue(false);

    global.document = {
      hasFocus: mockHasFocus,
    } as unknown as Document;

    global.window = {
      addEventListener: mockAddEventListener,
    } as unknown as Window & typeof globalThis;

    instance = {
      state: {},
    } as SocketService;

    (reconnectSocket as jest.Mock).mockResolvedValue(true);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should immediately attempt reconnection if document has focus', () => {
    mockHasFocus.mockReturnValue(true);

    checkFocusAndReconnect(instance);

    expect(reconnectSocket).toHaveBeenCalledWith(instance);
  });

  it('should not immediately attempt reconnection if document does not have focus', () => {
    mockHasFocus.mockReturnValueOnce(false);
    checkFocusAndReconnect(instance);

    expect(reconnectSocket).not.toHaveBeenCalled();
  });

  it('should set up a focus event listener if document does not have focus', () => {
    mockHasFocus.mockReturnValueOnce(false);
    checkFocusAndReconnect(instance);

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'focus',
      expect.any(Function),
      { once: true },
    );
  });

  it('should not run if window or document are undefined', () => {
    global.document = undefined as unknown as Document;
    global.window = undefined as unknown as Window & typeof globalThis;

    checkFocusAndReconnect(instance);

    expect(reconnectSocket).not.toHaveBeenCalled();
  });
});
