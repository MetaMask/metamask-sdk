import { sha256 } from '@noble/hashes/sha256';

/**
 * Generates a SHA-256 hash from a given input string and returns the hash as a hexadecimal string.
 *
 * @param {string} input - The input string to be hashed.
 * @returns {string} - The SHA-256 hash of the input string represented as a hexadecimal string.
 *
 * @example
 * const hash = hashString('1234567890');
 * console.log(hash);
 * // Output: "27bfc4d7edc3122b8d1d20d1d1c5a7b88e4c77b3b450a4cd9086f5efef88bd26"
 */
function hashString(input: string): string {
  // Encode the input string to a Uint8Array, which is required by the SHA-256 function
  const hash = sha256(new TextEncoder().encode(input));

  // Convert the resulting hash (Uint8Array) to a hexadecimal string
  const hashHex = Array.from(hash)
    .map((b) => b.toString(16).padStart(2, '0')) // Convert each byte to a 2-character hex string
    .join(''); // Concatenate all hex strings into one

  return hashHex;
}

export { hashString };
