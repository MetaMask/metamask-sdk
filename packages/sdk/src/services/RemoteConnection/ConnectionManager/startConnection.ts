import {
  DEFAULT_SESSION_TIMEOUT_MS,
  EventType,
  OriginatorInfo,
} from '@metamask/sdk-communication-layer';
import packageJson from '../../../../package.json';
import {
  METAMASK_CONNECT_BASE_URL,
  METAMASK_DEEPLINK_BASE,
} from '../../../constants';
import { base64Encode } from '../../../utils/base64';
import { logger } from '../../../utils/logger';
import { Ethereum } from '../../Ethereum';
import { initializeConnector } from '../ConnectionInitializer';
import { setupListeners } from '../EventListeners';
import { reconnectWithModalOTP } from '../ModalManager/reconnectWithModalOTP';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { connectWithDeeplink } from './connectWithDeeplink';
import { connectWithModalInstaller } from './connectWithModalInstaller';

export interface StartConnectionExtras {
  initialCheck?: boolean;
}

/**
 * Initiates the connection process to MetaMask, choosing the appropriate connection method based on state and options.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param options Configuration options for the connection.
 * @returns Promise<void>
 */
export async function startConnection(
  state: RemoteConnectionState,
  options: RemoteConnectionProps,
  { initialCheck }: StartConnectionExtras = {},
): Promise<void> {
  // Initialize the connector - will skip if already initialized
  initializeConnector(state, options);

  if (!state.connector) {
    throw new Error('no connector defined');
  }

  // Ensure listeners are set up
  setupListeners(state, options);

  const provider = Ethereum.getProvider();

  // reset authorization state
  state.authorized = false;

  // Establish socket connection
  provider.emit('connecting');

  const channelConfig = await state.connector?.originatorSessionConnect();
  logger(
    `[RemoteConnection: startConnection()] after originatorSessionConnect initialCheck=${initialCheck}`,
    channelConfig,
  );

  let channelId = channelConfig?.channelId ?? '';
  let pubKey = state.connector.getKeyInfo()?.ecies.public ?? '';
  let privKey = state.connector.getKeyInfo()?.ecies.private ?? '';

  if (initialCheck && !channelConfig) {
    return Promise.resolve();
  }

  // if (initialCheck && !channelConfig?.relayPersistence) {
  //   // Prevent autoconnect when new sdk --> old wallet.
  //   return Promise.resolve();
  // }

  if (!channelConfig && !initialCheck) {
    const newChannel = await state.connector.generateChannelIdConnect();
    channelId = newChannel.channelId ?? '';
    pubKey = newChannel.pubKey ?? '';
    privKey = newChannel.privKey ?? '';

    const now = Date.now();
    // Save channelId to storage for re-use until it expires or is terminated
    state.connector.state.storageManager?.persistChannelConfig({
      channelId,
      localKey: privKey,
      lastActive: now,
      validUntil: now + DEFAULT_SESSION_TIMEOUT_MS,
    });
  }

  if (initialCheck && channelConfig?.channelId) {
    if (!state.connector?.isConnected()) {
      logger(
        `[RemoteConnection: startConnection()] reconnecting to channel initialCheck=${initialCheck}`,
        channelConfig,
      );

      await state.connector?.connectToChannel({
        channelId,
      });
    }
    // Add condition to handle full relay persistence
    return Promise.resolve();
  }

  if (channelConfig && !state.connector?.isConnected()) {
    logger(
      `[RemoteConnection: startConnection()] reconnecting to channel`,
      channelConfig,
    );

    await state.connector?.connectToChannel({
      channelId,
    });
  }

  // if we are on desktop browser
  const qrCodeOrigin = state.platformManager?.isSecure() ? '' : '&t=q';
  const sdkVersion = packageJson.version;
  const { iconUrl, name, url, scheme } = options.dappMetadata || {};
  const platformType = state.platformManager?.getPlatformType();

  let base64OriginatorInfo: string | undefined;

  if (
    !(typeof window === 'undefined' || typeof window.location === 'undefined')
  ) {
    const originatorInfo: OriginatorInfo = {
      url: url ?? '',
      title: name ?? '',
      icon: iconUrl,
      scheme: scheme ?? '',
      apiVersion: sdkVersion,
      dappId: window?.location?.hostname ?? name ?? url ?? 'N/A',
      platform: platformType ?? '',
      source: options._source ?? '',
    };
    base64OriginatorInfo = base64Encode(JSON.stringify(originatorInfo));
  }

  const linkParams = encodeURI(
    `channelId=${channelId}&v=2&comm=${
      state.communicationLayerPreference ?? ''
    }&pubkey=${pubKey}${qrCodeOrigin}&originatorInfo=${base64OriginatorInfo}`,
  );

  const qrcodeLink = `${
    state.useDeeplink ? METAMASK_DEEPLINK_BASE : METAMASK_CONNECT_BASE_URL
  }?${linkParams}`;
  state.qrcodeLink = qrcodeLink;

  if (state.developerMode) {
    logger(`[RemoteConnection: startConnection()] qrcodeLink=${qrcodeLink}`);
  }

  // emit qrcode url link
  provider.emit('display_uri', qrcodeLink);

  // first handle secure connection
  if (state.platformManager?.isSecure()) {
    await connectWithDeeplink(state, linkParams);
    // wait for authorized event
    return new Promise((resolve) => {
      if (state.connector?.isAuthorized()) {
        resolve();
        return;
      }

      state.connector?.once(EventType.AUTHORIZED, () => {
        resolve();
      });
    });
  }

  if (channelConfig?.lastActive) {
    return reconnectWithModalOTP(state, options, channelConfig);
  }

  return connectWithModalInstaller(state, options, linkParams);
}
