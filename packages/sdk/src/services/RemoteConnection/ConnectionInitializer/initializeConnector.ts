import { RemoteCommunication } from '@metamask/sdk-communication-layer';
import packageJson from '../../../../package.json';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';

export function initializeConnector(
  state: RemoteConnectionState,
  options: RemoteConnectionProps,
) {
  const {
    dappMetadata,
    communicationLayerPreference,
    transports,
    _source,
    enableDebug = false,
    platformManager,
    timer,
    ecies,
    storage,
    communicationServerUrl,
    logging,
  } = options;

  if (state.developerMode) {
    console.debug(
      `RemoteConnection::initializeConnector() intialize connector`,
    );
  }

  state.connector = new RemoteCommunication({
    platformType: platformManager.getPlatformType(),
    communicationLayerPreference,
    transports,
    dappMetadata: { ...dappMetadata, source: _source },
    analytics: enableDebug,
    communicationServerUrl,
    sdkVersion: packageJson.version,
    context: 'dapp',
    ecies,
    storage,
    logging,
  });

  if (timer) {
    if (state.developerMode) {
      console.debug(`RemoteConnection::setup reset background timer`, timer);
    }

    timer?.stopBackgroundTimer?.();
    timer?.runBackgroundTimer?.(() => {
      // Used to maintain the connection when the app is backgrounded.
      // console.debug(`Running background timer`);
      return false;
    }, 10000);
  }
}
