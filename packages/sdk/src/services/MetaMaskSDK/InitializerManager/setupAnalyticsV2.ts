import { analytics } from '@metamask/sdk-analytics';
import { MetaMaskSDK } from '../../../sdk';

/**
 * Sets up the analytics instance for the MetaMask SDK.
 *
 * This function enables the global analytics client and sets the global properties.
 *
 * @param instance The MetaMaskSDK instance for which analytics will be set up.
 * @returns void
 * @async
 */
export async function setupAnalyticsV2(instance: MetaMaskSDK) {
  if (!instance.options.enableAnalytics) {
    return;
  }

  if (
    !instance.platformManager?.isBrowser() &&
    !instance.platformManager?.isReactNative()
  ) {
    return;
  }

  const version = instance.getVersion();
  const dappId = instance.getDappId();
  const anonId = await instance.getAnonId();
  const platform = instance.platformManager?.getPlatformType() as string;
  const integrationType = instance.options._source as string;

  analytics.setGlobalProperty('sdk_version', version);
  analytics.setGlobalProperty('dapp_id', dappId);
  analytics.setGlobalProperty('anon_id', anonId);
  analytics.setGlobalProperty('platform', platform);
  analytics.setGlobalProperty('integration_type', integrationType);

  analytics.enable();

  analytics.track('sdk_initialized', {});
}
