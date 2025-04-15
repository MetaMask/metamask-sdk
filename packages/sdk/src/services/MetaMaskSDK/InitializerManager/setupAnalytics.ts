import { DEFAULT_SERVER_URL } from '@metamask/sdk-communication-layer';
import { type OriginatorInfo } from '@metamask/sdk-types';
import { Analytics } from '../../Analytics';
import { MetaMaskSDK } from '../../../sdk';

/**
 * Sets up the analytics instance for the MetaMask SDK.
 *
 * This function initializes an Analytics object and attaches it to the MetaMask SDK instance.
 * The analytics object is configured based on various options like the server URL, debug settings, and Dapp metadata.
 *
 * @param instance The MetaMaskSDK instance for which analytics will be set up.
 * @returns void
 * @async
 */
export async function setupAnalytics(instance: MetaMaskSDK) {
  const { options } = instance;

  const platformType = instance.platformManager?.getPlatformType();

  const originator: OriginatorInfo = {
    url: options.dappMetadata.url ?? '',
    title: options.dappMetadata.name ?? '',
    dappId:
      typeof window === 'undefined' || typeof window.location === 'undefined'
        ? options.dappMetadata?.name ?? options.dappMetadata?.url ?? 'N/A'
        : window.location.hostname,
    platform: platformType ?? '',
    source: options._source ?? '',
  };

  instance.analytics = new Analytics({
    serverUrl: options.communicationServerUrl ?? DEFAULT_SERVER_URL,
    enabled: options.enableAnalytics,
    originatorInfo: originator,
  });
}
