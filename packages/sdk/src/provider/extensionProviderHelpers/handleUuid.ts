import { v4 as uuidv4 } from 'uuid';
import { PlatformType } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../sdk';
import { base64Encode } from '../../utils/base64';

interface DappIdentifier {
  url: string;
  name: string;
}

/**
 * Retrieves or generates a unique identifier for a dapp based on its metadata,
 * and determines the platform type from which the request is originating.
 *
 * @param {SDKInstance} sdkInstance - The SDK instance containing metadata and platform manager information.
 *
 * The `sdkInstance` parameter should have the following structure:
 * - `dappMetadata` (optional): An object containing metadata about the dapp.
 *   - `url`: The URL of the dapp (e.g., 'https://example.com').
 *   - `name`: The name of the dapp (e.g., 'Example Dapp').
 * - `platformManager` (optional): An object responsible for managing platform-specific details.
 *   - `getPlatformType`: A function that returns the platform type, typically an enum like `PlatformType.DesktopWeb` or `PlatformType.MetaMaskMobileWebview`.
 *
 * @returns {{ id: string, from: string }} - An object containing the following properties:
 * - `id`: A unique identifier (UUID) for the dapp, generated based on the dapp's URL and name.
 * - `from`: A string indicating the platform type from which the request originates:
 *   - `'extension'` if the platform type is `DesktopWeb`.
 *   - `'mobile'` if the platform type is `MetaMaskMobileWebview`.
 *   - `'N/A'` if the platform type is neither of the above or undefined.
 */
function getPlatformDetails(sdkInstance: MetaMaskSDK) {
  const { dappMetadata } = sdkInstance;
  const url = dappMetadata?.url ?? 'no_url';
  const name = dappMetadata?.name ?? 'no_name';
  const id = getOrCreateUuidForIdentifier({ url, name });

  const platFormType = sdkInstance.platformManager?.getPlatformType();
  const isExtension = platFormType === PlatformType.DesktopWeb;
  const isInAppBrowser = platFormType === PlatformType.MetaMaskMobileWebview;

  let from = 'N/A';
  if (isExtension) {
    from = 'extension';
  } else if (isInAppBrowser) {
    from = 'mobile';
  }

  return {
    id,
    from,
  };
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

export { getOrCreateUuidForIdentifier, getPlatformDetails };
