export function base64Encode(str: string): string {
  if (typeof btoa === 'function') {
    // Web environment
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/gu, (_match, p1) =>
        String.fromCharCode(parseInt(p1, 16)),
      ),
    );
  } else if (typeof Buffer !== 'undefined') {
    // Node.js environment
    return Buffer.from(str, 'utf8').toString('base64');
  } else if (typeof global.Buffer !== 'undefined') {
    // React Native environment
    return global.Buffer.from(str, 'utf8').toString('base64');
  }
  throw new Error('Unable to base64 encode: No available method.');
}
