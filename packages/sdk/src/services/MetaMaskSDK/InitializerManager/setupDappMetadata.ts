import { MetaMaskSDK } from '../../../sdk';

/**
 * Sets up Dapp metadata for the MetaMask SDK instance.
 *
 * This function configures the Dapp metadata by extracting the favicon and converting it to base64 format.
 * If a base64 icon is not already present in the options, it will try to extract a default favicon from the Dapp.
 * The processed metadata is then attached to the MetaMask SDK instance.
 *
 * @param instance The MetaMaskSDK instance for which Dapp metadata will be set up.
 * @returns void
 * @async
 */
export async function setupDappMetadata(instance: MetaMaskSDK) {
  const { options } = instance;

  // Check if iconUrl and url are valid
  const urlPattern = /^https?:\/\//u; // Regular expression for URLs starting with http:// or https://

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
