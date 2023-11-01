import { RemoteCommunicationPostMessageStream } from '../../PostMessageStream/RemoteCommunicationPostMessageStream';
import { METHODS_TO_REDIRECT, RPC_METHODS } from '../../config';
import {
  METAMASK_CONNECT_BASE_URL,
  METAMASK_DEEPLINK_BASE,
} from '../../constants';
import { Ethereum } from '../Ethereum';
import { extractMethod } from './extractMethod';

export async function write(
  instance: RemoteCommunicationPostMessageStream,
  chunk: any,
  _encoding: BufferEncoding,
  callback: (error?: Error | null) => void,
) {
  // Special Case if trusted device (RN or mobile web), we still create deeplink to wake up the connection.
  const isRemoteReady = instance.state.remote?.isReady();
  const socketConnected = instance.state.remote?.isConnected();
  const isPaused = instance.state.remote?.isPaused();
  const provider = Ethereum.getProvider();
  const channelId = instance.state.remote?.getChannelId();
  const authorized = instance.state.remote?.isAuthorized();
  const { method: targetMethod, data } = extractMethod(chunk);

  if (instance.state.debug) {
    console.debug(
      `RPCMS::_write method='${targetMethod}' isRemoteReady=${isRemoteReady} channelId=${channelId} isSocketConnected=${socketConnected} isRemotePaused=${isPaused} providerConnected=${provider.isConnected()}`,
      chunk,
    );
  }

  if (!channelId) {
    // ignore initial metamask_getProviderState() call from ethereum.init()
    if (
      instance.state.debug &&
      targetMethod !== RPC_METHODS.METAMASK_GETPROVIDERSTATE
    ) {
      console.warn(`RPCMS::_write Invalid channel id -- undefined`);
    }

    return callback();
  }

  if (instance.state.debug) {
    console.debug(
      `RPCMS::_write remote.isPaused()=${instance.state.remote?.isPaused()} authorized=${authorized} ready=${isRemoteReady} socketConnected=${socketConnected}`,
      chunk,
    );
  }

  try {
    instance.state.remote
      ?.sendMessage(data?.data)
      .then(() => {
        if (instance.state.debug) {
          console.debug(`RCPMS::_write ${targetMethod} sent successfully`);
        }
      })
      .catch((err: unknown) => {
        console.error('RCPMS::_write error sending message', err);
      });

    if (!instance.state.platformManager?.isSecure()) {
      // Redirect early if nodejs or browser...
      if (instance.state.debug) {
        console.log(
          `RCPMS::_write unsecure platform for method ${targetMethod} -- return callback`,
        );
      }
      return callback();
    }

    if (!socketConnected && !isRemoteReady) {
      // Invalid connection status
      if (instance.state.debug) {
        console.debug(
          `RCPMS::_write invalid connection status targetMethod=${targetMethod} socketConnected=${socketConnected} ready=${isRemoteReady} providerConnected=${provider.isConnected()}\n\n`,
        );
      }

      return callback();
    }

    if (!socketConnected && isRemoteReady) {
      // Shouldn't happen -- needs to refresh
      console.warn(`RCPMS::_write invalid socket status -- shouln't happen`);
      return callback();
    }

    // Check if should open app
    const pubKey = instance.state.remote?.getKeyInfo()?.ecies.public ?? '';

    const urlParams = encodeURI(
      `channelId=${channelId}&pubkey=${pubKey}&comm=socket&t=q`,
    );

    if (METHODS_TO_REDIRECT[targetMethod]) {
      if (instance.state.debug) {
        console.debug(
          `RCPMS::_write redirect link for '${targetMethod}' socketConnected=${socketConnected}`,
          `connect?${urlParams}`,
        );
      }

      // Use otp to re-enable host approval
      instance.state.platformManager?.openDeeplink(
        `${METAMASK_CONNECT_BASE_URL}?${urlParams}`,
        `${METAMASK_DEEPLINK_BASE}?${urlParams}`,
        '_self',
      );
    } else if (instance.state.remote?.isPaused()) {
      if (instance.state.debug) {
        console.debug(
          `RCPMS::_write MM is PAUSED! deeplink with connect! targetMethod=${targetMethod}`,
        );
      }

      instance.state.platformManager?.openDeeplink(
        `${METAMASK_CONNECT_BASE_URL}?redirect=true&${urlParams}`,
        `${METAMASK_DEEPLINK_BASE}?redirect=true&${urlParams}`,
        '_self',
      );
    } else {
      // Already connected with custom rpc method (don't need redirect) - send message without opening metamask mobile.
      // instance only happens when metamask was opened in last 30seconds.
      console.debug(
        `RCPMS::_write method ${targetMethod} doesn't need redirect.`,
      );
    }
  } catch (err) {
    if (instance.state.debug) {
      console.error('RCPMS::_write error', err);
    }
    return callback(
      new Error('RemoteCommunicationPostMessageStream - disconnected'),
    );
  }

  return callback();
}
