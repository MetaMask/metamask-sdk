/**
 * Generate a UUID v4 using native crypto APIs when available
 * Falls back to a Math.random implementation for older environments
 */
export function generateUUID(): string {
  // Try native crypto.randomUUID first (most efficient)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  // This generates a valid UUID v4 format
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Set version (4) and variant bits according to UUID v4 spec
    // eslint-disable-next-line no-bitwise
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    // eslint-disable-next-line no-bitwise
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

    // Convert to hex string with dashes
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16,
    )}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  // Last resort: Math.random (less secure but works everywhere)
  // This is the same algorithm used by many UUID polyfills
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Alias for drop-in replacement
export const uuidv4 = generateUUID;