import {
  METAMASK_CONNECT_BASE_URL,
  METAMASK_DEEPLINK_BASE,
} from '../../../constants';
import { logger } from '../../../utils/logger';
import { Ethereum } from '../../Ethereum';
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
  if (!state.connector) {
    throw new Error('no connector defined');
  }

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

  if (initialCheck && !channelConfig) {
    return Promise.resolve();
  }

  if (initialCheck && !channelConfig?.relayPersistence) {
    // Prevent autoconnect when new sdk --> old wallet.
    return Promise.resolve();
  }

  if (!channelConfig && !initialCheck) {
    const newChannel = await state.connector.generateChannelIdConnect();
    channelId = newChannel.channelId ?? '';
    pubKey = state.connector.getKeyInfo()?.ecies.public ?? '';
  }

  if (initialCheck && channelConfig?.channelId) {
    if (!state.connector?.isConnected()) {
      logger(
        `[RemoteConnection: startConnection()] reconnecting to channel initialCheck=${initialCheck}`,
        channelConfig,
      );

      state.connector?.connectToChannel({
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

    state.connector?.connectToChannel({
      channelId,
    });
  }

  // if we are on desktop browser
  const qrCodeOrigin = state.platformManager?.isSecure() ? '' : '&t=q';

  const linkParams = encodeURI(
    `channelId=${channelId}&v=2&comm=${
      state.communicationLayerPreference ?? ''
    }&pubkey=${pubKey}${qrCodeOrigin}`,
  );

  const qrcodeLink = `${
    state.useDeeplink ? METAMASK_DEEPLINK_BASE : METAMASK_CONNECT_BASE_URL
  }?${linkParams}`;
  state.qrcodeLink = qrcodeLink;

  if (state.developerMode) {
    logger(`[RemoteConnection: startConnection()] qrcodeLink=${qrcodeLink}`);
  }

  // first handle secure connection
  if (state.platformManager?.isSecure()) {
    // FIXME do we also need to wait for event on secure platform? ready / authorized
    return connectWithDeeplink(state, linkParams);
  }

  if (channelConfig?.lastActive) {
    return reconnectWithModalOTP(state, options, channelConfig);
  }

  return connectWithModalInstaller(state, options, linkParams);
}
