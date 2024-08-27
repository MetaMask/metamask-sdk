import { v4 as uuidv4 } from 'uuid';

/**
 * Encodes a string to Base64 format, handling UTF-8 strings properly.
 *
 * @param {string} str - The string to encode.
 * @returns {string} - The Base64 encoded string.
 */
function toBase64(str: string): string {
  const encoded = new TextEncoder().encode(str);
  const base64String = btoa(String.fromCharCode(...encoded));

  return base64String;
}

/**
 * Gets or creates a unique identifier (UUID) based on the provided url and name.
 * The identifier is stored in localStorage using a Base64 encoded combination of `url` and `name`.
 *
 * @param {string} url - The URL of the dapp.
 * @param {string} name - The name of the dapp.
 * @returns {string} - The unique identifier (UUID) for the dapp.
 */
function getOrCreateUuidForIdentifier(url: string, name: string): string {
  const rawIdentifier = url + name;
  const encodedIdentifier = toBase64(rawIdentifier);

  let storedUuid = localStorage.getItem(encodedIdentifier) ?? '';

  if (!storedUuid) {
    storedUuid = uuidv4();
    localStorage.setItem(encodedIdentifier, storedUuid);
  }

  return storedUuid;
}

export { toBase64, getOrCreateUuidForIdentifier };
