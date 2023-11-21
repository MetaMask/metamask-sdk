import { MetaMaskSDK } from '../../../sdk';
import { extractFavicon } from '../../../utils/extractFavicon';

/**
 * Validates and attaches Dapp metadata to a MetaMask SDK instance.
 *
 * This function checks 'iconUrl' and 'url' in the Dapp metadata, ensuring they start with 'http://' or 'https://'.
 * If these URLs are incorrectly formatted, an error is thrown. Valid metadata is then attached to the SDK instance.
 * Note: This function does not handle favicon extraction or base64 conversion.
 *
 * @param instance The MetaMaskSDK instance for which Dapp metadata will be set up.
 * @returns void
 */

const BASE_64_ICON_MAX_LENGTH = 163400;

export function setupDappMetadata(instance: MetaMaskSDK) {
  const { options } = instance;

  // Check if iconUrl and url are valid
  // eslint-disable-next-line require-unicode-regexp
  const urlPattern = /^(http|https):\/\/[^\s]*$/; // Regular expression for URLs starting with http:// or https://

  if (options.dappMetadata) {
    if (
      options.dappMetadata.iconUrl &&
      !urlPattern.test(options.dappMetadata.iconUrl)
    ) {
      console.warn(
        'Invalid dappMetadata.iconUrl: URL must start with http:// or https://',
      );

      options.dappMetadata.iconUrl = undefined;
    }

    // This check ensures that the base64Icon string in the dappMetadata does not exceed 163,400 characters.
    // The character limit is important because a longer base64-encoded string causes the connection to the mobile app to fail.
    // Keeping the base64Icon string length below this threshold ensures reliable communication and functionality.
    if (
      options.dappMetadata.base64Icon &&
      options.dappMetadata.base64Icon.length > BASE_64_ICON_MAX_LENGTH
    ) {
      console.warn(
        'Invalid dappMetadata.base64Icon: Base64-encoded icon string length must be less than 163400 characters',
      );

      options.dappMetadata.base64Icon = undefined;
    }

    if (
      options.dappMetadata.url &&
      !urlPattern.test(options.dappMetadata.url)
    ) {
      console.warn(
        'Invalid dappMetadata.url: URL must start with http:// or https://',
      );
    }

    const favicon = extractFavicon();

    if (
      favicon &&
      !options.dappMetadata.iconUrl &&
      !options.dappMetadata.base64Icon
    ) {
      options.dappMetadata.iconUrl = favicon;
    }
  }

  // eslint-disable-next-line require-atomic-updates
  instance.dappMetadata = options.dappMetadata;
}
