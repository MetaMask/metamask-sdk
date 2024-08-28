import { v4 as uuidv4 } from 'uuid';
import { base64Encode } from '../../utils/base64';

interface DappIdentifier {
  url: string;
  name: string;
}

/**
 * Gets or creates a unique identifier (UUID) based on the provided url and name.
 * The identifier is stored in localStorage using a Base64 encoded combination of `url` and `name`.
 *
 * @param {DappIdentifier} identifier - An object containing the `url` and `name` of the dapp.
 * @returns {string} - The unique identifier (UUID) for the dapp.
 */
function getOrCreateUuidForIdentifier({ url, name }: DappIdentifier): string {
  const rawIdentifier = url + name;
  const encodedIdentifier = base64Encode(rawIdentifier);

  let storedUuid = localStorage.getItem(encodedIdentifier) ?? '';

  if (!storedUuid) {
    storedUuid = uuidv4();
    localStorage.setItem(encodedIdentifier, storedUuid);
  }

  return storedUuid;
}

export { getOrCreateUuidForIdentifier };
