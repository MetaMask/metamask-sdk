import { METAMASK_CONNECT_BASE_URL } from '../../../constants';
import { Ethereum } from '../../Ethereum';
import { reconnectWithModalOTP } from '../ModalManager/reconnectWithModalOTP';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { connectWithDeeplink } from './connectWithDeeplink';
import { connectWithModalInstaller } from './connectWithModalInstaller';

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
): Promise<void | undefined> {
  if (!state.connector) {
    throw new Error('no connector defined');
  }

  const provider = Ethereum.getProvider();

  // reset authorization state
  state.authorized = false;

  // Establish socket connection
  provider.emit('connecting');

  const channelConfig = await state.connector?.originatorSessionConnect();
  if (state.developerMode) {
    console.debug(
      `RemoteConnection::startConnection after startAutoConnect`,
      channelConfig,
    );
  }

  let channelId = channelConfig?.channelId ?? '';
  let pubKey = state.connector.getKeyInfo()?.ecies.public ?? '';

  if (!channelConfig) {
    const newChannel = await state.connector.generateChannelIdConnect();
    channelId = newChannel.channelId ?? '';
    pubKey = state.connector.getKeyInfo()?.ecies.public ?? '';
  }

  const linkParams = encodeURI(
    `channelId=${channelId}&comm=${
      state.communicationLayerPreference ?? ''
    }&pubkey=${pubKey}`,
  );
  const universalLink = `${METAMASK_CONNECT_BASE_URL}?${linkParams}`;
  state.universalLink = universalLink;

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
