// Helper functions
export function isHexString(value: string): boolean {
  if (value === '0x') {
    return false;
  }
  return /^0x([0-9A-Fa-f]{2})+$/u.test(value);
}

export function stringToHex(value: string): string {
  let hexString: string;

  if (typeof Buffer !== 'undefined') {
    // Node.js environment
    hexString = Buffer.from(value, 'utf8').toString('hex');
  } else if (typeof TextEncoder !== 'undefined') {
    // Web environment
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(value);
    hexString = Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  } else if (typeof global === 'object' && 'Buffer' in global) {
    // React Native environment
    hexString = global.Buffer.from(value, 'utf8').toString('hex');
  } else {
    throw new Error('Unable to convert string to hex: No available method.');
  }

  return `0x${hexString}`;
}

export function hexToString(hex: string): string {
  if (!isHexString(hex)) {
    throw new Error('Invalid hex string');
  }

  const hexWithoutPrefix = hex.slice(2);
  let string: string;

  if (typeof Buffer !== 'undefined') {
    // Node.js environment
    string = Buffer.from(hexWithoutPrefix, 'hex').toString('utf8');
  } else if (typeof TextDecoder !== 'undefined') {
    // Web environment
    const matches = hexWithoutPrefix.match(/.{1,2}/gu);
    if (!matches) {
      throw new Error('Invalid hex string');
    }
    const bytes = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
    string = new TextDecoder('utf-8').decode(bytes);
  } else if (typeof global === 'object' && 'Buffer' in global) {
    // React Native environment
    string = global.Buffer.from(hexWithoutPrefix, 'hex').toString('utf8');
  } else {
    throw new Error('Unable to convert hex to string: No available method.');
  }

  return string;
}
