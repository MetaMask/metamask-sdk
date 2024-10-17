import { isHexString, stringToHex, hexToString } from './hex.utils';

describe('hex utils', () => {
  describe('isHexString', () => {
    it('should return true for valid hex strings', () => {
      expect(isHexString('0x1234')).toBe(true);
      expect(isHexString('0xabcdef')).toBe(true);
      expect(isHexString('0xABCDEF')).toBe(true);
      expect(isHexString('0x123ABC')).toBe(true);
    });

    it('should return false for invalid hex strings', () => {
      expect(isHexString('1234')).toBe(false);
      expect(isHexString('0x12G')).toBe(false);
      expect(isHexString('0x')).toBe(false);
      expect(isHexString('abc')).toBe(false);
    });
  });

  describe('stringToHex', () => {
    it('should convert ASCII strings to hex', () => {
      expect(stringToHex('Hello')).toBe('0x48656c6c6f');
      expect(stringToHex('World')).toBe('0x576f726c64');
    });

    it('should convert empty string to hex', () => {
      expect(stringToHex('')).toBe('0x');
    });

    it('should convert Unicode strings to hex', () => {
      expect(stringToHex('こんにちは')).toBe(
        '0xe38193e38293e381abe381a1e381af',
      );
      expect(stringToHex('🚀')).toBe('0xf09f9a80');
    });
  });

  describe('hexToString', () => {
    it('should convert hex to ASCII strings', () => {
      expect(hexToString('0x48656c6c6f')).toBe('Hello');
      expect(hexToString('0x576f726c64')).toBe('World');
    });

    it('should convert empty hex to empty string', () => {
      expect(hexToString('0x')).toBe('');
    });

    it('should convert hex to Unicode strings', () => {
      expect(hexToString('0xe38193e38293e381abe381a1e381af')).toBe(
        'こんにちは',
      );
      expect(hexToString('0xf09f9a80')).toBe('🚀');
    });

    it('should throw an error for invalid hex strings', () => {
      expect(() => hexToString('invalid')).toThrow('Invalid hex string');
      expect(() => hexToString('0x123G')).toThrow('Invalid hex string');
    });
  });

  describe('roundtrip conversion', () => {
    const testCases = [
      'Hello, World!',
      'こんにちは、世界！',
      '🚀✨🌍',
      '',
      'The quick brown fox jumps over the lazy dog.',
    ];

    testCases.forEach((testCase) => {
      it(`should correctly roundtrip: ${testCase}`, () => {
        const hex = stringToHex(testCase);
        const roundtrip = hexToString(hex);
        expect(roundtrip).toBe(testCase);
      });
    });
  });
});
