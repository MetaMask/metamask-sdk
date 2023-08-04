// connectionManager.ts

import { Ethereum } from '../../Ethereum';
import { reconnectWithModalOTP } from '../ModalManager/reconnectWithModalOTP';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { connectWithDeeplink } from './connectWithDeeplink';
import { connectWithModalInstaller } from './connectWithModalInstaller';

export async function startConnection(
  state: RemoteConnectionState,
  options: RemoteConnectionProps,
): Promise<void> {
  if (!state.connector) {
    console.log('channelConfig is undefined');
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
    console.log('channelConfig is undefined');
    const newChannel = await state.connector.generateChannelIdConnect();
    channelId = newChannel.channelId ?? '';
    pubKey = state.connector.getKeyInfo()?.ecies.public ?? '';
  }

  const linkParams = encodeURI(
    `channelId=${channelId}&comm=${state.communicationLayerPreference}&pubkey=${pubKey}`,
  );
  const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
  state.universalLink = universalLink;

  // first handle secure connection
  if (state.platformManager?.isSecure()) {
    console.log('AAA');
    // FIXME do we also need to wait for event on secure platform? ready / authorized
    return connectWithDeeplink(state, linkParams);
  }

  if (channelConfig?.lastActive) {
    console.log('BBB');
    return reconnectWithModalOTP(state, options);
  }
  console.log('CCCC');
  return connectWithModalInstaller(state, options, linkParams);
}
