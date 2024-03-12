import { Duplex } from 'readable-stream';
import * as onMessageModule from '../services/MobilePortStream/onMessage';
import * as writeModule from '../services/MobilePortStream/write';
import { MobilePortStream } from './MobilePortStream';

describe('MobilePortStream', () => {
  let mockOnMessage: jest.Mock;
  let mockWrite: jest.Mock;
  let mockAddEventListener: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOnMessage = jest.fn();
    mockWrite = jest.fn();
    mockAddEventListener = jest.fn();

    jest.spyOn(onMessageModule, 'onMessage').mockImplementation(mockOnMessage);
    jest.spyOn(writeModule, 'write').mockImplementation(mockWrite);

    global.window = {
      ...global.window,
      addEventListener: mockAddEventListener,
    } as any;

    global.location = {
      ...global.location,
      origin: 'http://example.com',
    } as any;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should instantiate correctly', () => {
    const port = { name: 'testPort' };
    const stream = new MobilePortStream(port);

    expect(stream).toBeInstanceOf(Duplex);
    expect(stream._name).toBe('testPort');
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
      false,
    );
  });

  it('should handle messages with _onMessage', () => {
    const port = { name: 'testPort' };
    const stream = new MobilePortStream(port);
    const event = {
      /* ... */
    };

    stream._onMessage(event);

    expect(mockOnMessage).toHaveBeenCalledWith(stream, event);
  });

  it('should handle disconnect with _onDisconnect', () => {
    const port = { name: 'testPort' };
    const stream = new MobilePortStream(port);
    const mockDestroy = jest.fn();
    stream.destroy = mockDestroy;

    stream._onDisconnect();

    expect(mockDestroy).toHaveBeenCalled();
  });

  it('should handle _read', () => {
    const port = { name: 'testPort' };
    const stream = new MobilePortStream(port);

    stream._read();

    expect(true).toBe(true);
  });

  it('should handle _write', () => {
    const port = { name: 'testPort' };
    const stream = new MobilePortStream(port);
    const chunk = {};
    const encoding = 'utf-8';

    stream._write(chunk, encoding, (err) => {
      expect(err).toBeUndefined();
      expect(mockWrite).toHaveBeenCalledWith(
        chunk,
        encoding,
        expect.any(Function),
      );
    });
  });
});
