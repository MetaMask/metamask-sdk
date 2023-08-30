import { MetaMaskSDK } from '../../../sdk';
import { extractFavicon } from '../../../utils/extractFavicon';
import { getBase64FromUrl } from '../../../utils/getBase64FromUrl';

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

  if (
    instance.platformManager?.isBrowser() &&
    !options.dappMetadata.base64Icon
  ) {
    // Try to extract default icon
    const favicon = extractFavicon();
    if (favicon) {
      try {
        const faviconUri = await getBase64FromUrl(favicon);
        options.dappMetadata.base64Icon = faviconUri;
      } catch (err) {
        // Ignore favicon error.
      }
    }
  }

  // eslint-disable-next-line require-atomic-updates
  instance.dappMetadata = options.dappMetadata;
}
