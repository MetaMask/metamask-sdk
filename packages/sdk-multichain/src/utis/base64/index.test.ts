import * as t from 'vitest';

import { base64Encode } from '.';

t.describe('base64Encode', () => {
  t.it('should encode an empty string', () => {
    t.expect(base64Encode('')).toBe('');
  });

  t.it('should encode a simple ASCII string', () => {
    t.expect(base64Encode('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  t.it('should encode a string with special characters', () => {
    t.expect(base64Encode('!@#$%^&*()_+')).toBe('IUAjJCVeJiooKV8r');
  });

  t.it('should encode a Unicode string', () => {
    t.expect(base64Encode('こんにちは')).toBe('44GT44KT44Gr44Gh44Gv');
  });

  t.it('should encode a mixed ASCII and Unicode string', () => {
    t.expect(base64Encode('Hello, 世界!')).toBe('SGVsbG8sIOS4lueVjCE=');
  });

  t.it('should encode using global btoa object if buffer is undefined or not available', () => {
    const originalBuffer = global.Buffer;
    global.Buffer = undefined as any;

    const btoa = t.vi.spyOn(global, 'btoa');
    btoa.mockImplementation(() => 'base64encoded');

    t.expect(base64Encode('Hello, World!')).toBe('base64encoded');

    // Restore Buffer
    global.Buffer = originalBuffer;
    btoa.mockRestore();
  });

  t.it('should encode a long string', () => {
    const longString = 'a'.repeat(1000);
    const encodedString = base64Encode(longString);

    // Check the start and end of the string
    t.expect(encodedString.startsWith('YWFhYWFhYWFh')).toBe(true);
    t.expect(encodedString.endsWith('YWFhYWFhYWFhYQ==')).toBe(true);

    // Check that it only contains valid base64 characters
    t.expect(encodedString).toMatch(/^[A-Za-z0-9+/]+=*$/u);

    // Optionally, you can check the number of 'Y' characters, which should be consistent
    t.expect(encodedString.match(/Y/gu)?.length).toBe(334);
  });
});
