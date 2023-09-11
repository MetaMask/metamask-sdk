import { Buffer } from 'buffer';
import { write } from './write';

describe('write function', () => {
  const cb: jest.Mock = jest.fn();
  const mockPostMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    global.window = {
      ...global.window,
      location: { href: 'http://example.com' },
      ReactNativeWebView: { postMessage: mockPostMessage },
    } as any;
  });

  it('should handle Buffer chunks', () => {
    const buffer = Buffer.from('test');
    global.window = {
      location: { href: 'http://example.com' },
      ReactNativeWebView: { postMessage: mockPostMessage },
    } as any;

    write(buffer, 'utf-8', cb);

    expect(cb).toHaveBeenCalledWith();
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining('"type":"Buffer"'),
    );
  });

  it('should handle chunks with data property', () => {
    const chunk = { data: {} };
    global.window = {
      location: { href: 'http://example.com' },
      ReactNativeWebView: { postMessage: mockPostMessage },
    } as any;

    write(chunk, 'utf-8', cb);

    expect(cb).toHaveBeenCalledWith();
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining('"toNative":true'),
    );
  });

  it('should handle other chunks', () => {
    const chunk = { other: 'property' };
    global.window = {
      location: { href: 'http://example.com' },
      ReactNativeWebView: { postMessage: mockPostMessage },
    } as any;

    write(chunk, 'utf-8', cb);

    expect(cb).toHaveBeenCalledWith();
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining('"other":"property"'),
    );
  });

  it('should handle errors gracefully', () => {
    const buffer = Buffer.from('test');
    global.window = {
      location: { href: 'http://example.com' },
      ReactNativeWebView: {
        postMessage: jest.fn(() => {
          throw new Error('An error occurred');
        }),
      },
    } as any;

    write(buffer, 'utf-8', cb);

    expect(cb).toHaveBeenCalledWith(
      new Error('MobilePortStream - disconnected'),
    );
  });
});
