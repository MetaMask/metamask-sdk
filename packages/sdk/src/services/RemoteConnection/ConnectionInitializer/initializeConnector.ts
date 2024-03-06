import { RemoteCommunication } from '@metamask/sdk-communication-layer';
import { logger } from '../../../utils/logger';
import packageJson from '../../../../package.json';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';

/**
 * Initializes the connector for MetaMask remote communication based on provided options.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param options Configuration options for the remote connection.
 * @returns void
 */
export function initializeConnector(
  state: RemoteConnectionState,
  options: RemoteConnectionProps,
) {
  logger(`[RemoteConnection: initializeConnector()] initialize connector`);

  state.connector = new RemoteCommunication({
    platformType: options.platformManager.getPlatformType(),
    communicationLayerPreference: options.communicationLayerPreference,
    transports: options.transports,
    dappMetadata: { ...options.dappMetadata, source: options._source },
    analytics: options.enableAnalytics,
    communicationServerUrl: options.communicationServerUrl,
    sdkVersion: packageJson.version,
    context: 'dapp',
    ecies: options.ecies,
    storage: options.storage,
    logging: options.logging,
  });

  if (options.timer) {
    logger(
      `[RemoteConnection: initializeConnector()] reset background timer`,
      options.timer,
    );

    options.timer?.stopBackgroundTimer?.();
    options.timer?.runBackgroundTimer?.(() => {
      // Used to maintain the connection when the app is backgrounded.
      // console.debug(`Running background timer`);
      return false;
    }, 10000);
  }
}
