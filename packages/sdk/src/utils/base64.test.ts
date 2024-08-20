import { base64Encode } from './base64';

describe('base64Encode', () => {
  it('should encode an empty string', () => {
    expect(base64Encode('')).toBe('');
  });

  it('should encode a simple ASCII string', () => {
    expect(base64Encode('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  it('should encode a string with special characters', () => {
    expect(base64Encode('!@#$%^&*()_+')).toBe('IUAjJCVeJiooKV8r');
  });

  it('should encode a Unicode string', () => {
    expect(base64Encode('こんにちは')).toBe('44GT44KT44Gr44Gh44Gv');
  });

  it('should encode a mixed ASCII and Unicode string', () => {
    expect(base64Encode('Hello, 世界!')).toBe('SGVsbG8sIOS4lueVjCE=');
  });

  it('should encode a long string', () => {
    const longString = 'a'.repeat(1000);
    const encodedString = base64Encode(longString);

    // Check the length (it should be consistent)
    expect(encodedString).toHaveLength(1336);

    // Check the start and end of the string
    expect(encodedString.startsWith('YWFhYWFhYWFh')).toBe(true);
    expect(encodedString.endsWith('YWFhYWFhYWFhYQ==')).toBe(true);

    // Check that it only contains valid base64 characters
    expect(encodedString).toMatch(/^[A-Za-z0-9+/]+=*$/u);

    // Optionally, you can check the number of 'Y' characters, which should be consistent
    expect(encodedString.match(/Y/gu)?.length).toBe(334);
  });
});
