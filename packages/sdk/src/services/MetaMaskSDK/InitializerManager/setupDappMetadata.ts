import { MetaMaskSDK } from '../../../sdk';

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

export function setupDappMetadata(instance: MetaMaskSDK) {
  const { options } = instance;

  // Check if iconUrl and url are valid
  // eslint-disable-next-line require-unicode-regexp
  const urlPattern = /^(http|https):\/\/[^\s]*|localhost(:\d+)?$/; // Regular expression for URLs starting with http:// or https://

  if (options.dappMetadata) {
    if (
      options.dappMetadata.iconUrl &&
      !urlPattern.test(options.dappMetadata.iconUrl)
    ) {
      throw new Error(
        'Invalid dappMetadata.iconUrl: URL must start with http:// or https://',
      );
    }

    if (
      options.dappMetadata.url &&
      !urlPattern.test(options.dappMetadata.url)
    ) {
      throw new Error(
        'Invalid dappMetadata.url: URL must start with http:// or https://',
      );
    }
  }

  // eslint-disable-next-line require-atomic-updates
  instance.dappMetadata = options.dappMetadata;
}
