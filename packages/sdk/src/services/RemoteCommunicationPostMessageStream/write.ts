import { logger } from '../../utils/logger';
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

  logger(
    `[RCPMS: write()] method='${targetMethod}' isRemoteReady=${isRemoteReady} channelId=${channelId} isSocketConnected=${socketConnected} isRemotePaused=${isPaused} providerConnected=${provider.isConnected()}`,
    chunk,
  );

  if (!channelId) {
    // ignore initial metamask_getProviderState() call from ethereum.init()
    if (targetMethod !== RPC_METHODS.METAMASK_GETPROVIDERSTATE) {
      logger(`[RCPMS: write()] Invalid channel id -- undefined`);
    }

    return callback();
  }

  logger(
    `[RCPMS: write()] remote.isPaused()=${instance.state.remote?.isPaused()} authorized=${authorized} ready=${isRemoteReady} socketConnected=${socketConnected}`,
    chunk,
  );

  try {
    instance.state.remote
      ?.sendMessage(data?.data)
      .then(() => {
        logger(`[RCPMS: _write()] ${targetMethod} sent successfully`);
      })
      .catch((err: unknown) => {
        logger(`[RCPMS: _write()] error sending message`, err);
      });

    if (!instance.state.platformManager?.isSecure()) {
      // Redirect early if nodejs or browser...
      logger(
        `[RCPMS: _write()] unsecure platform for method ${targetMethod} -- return callback`,
      );
      return callback();
    }

    if (!socketConnected && !isRemoteReady) {
      // Invalid connection status
      logger(
        `[RCPMS: _write()] invalid connection status targetMethod=${targetMethod} socketConnected=${socketConnected} ready=${isRemoteReady} providerConnected=${provider.isConnected()}`,
      );

      return callback();
    }

    if (!socketConnected && isRemoteReady) {
      // Shouldn't happen -- needs to refresh
      console.warn(
        `[RCPMS: _write()] invalid socket status -- shouldn't happen`,
      );
      return callback();
    }

    // Check if should open app
    const pubKey = instance.state.remote?.getKeyInfo()?.ecies.public ?? '';

    const urlParams = encodeURI(
      `channelId=${channelId}&pubkey=${pubKey}&comm=socket&t=d&v=2`,
    );

    if (METHODS_TO_REDIRECT[targetMethod]) {
      logger(
        `[RCPMS: _write()] redirect link for '${targetMethod}' socketConnected=${socketConnected} connect?${urlParams}`,
      );

      // Use otp to re-enable host approval
      instance.state.platformManager?.openDeeplink(
        `${METAMASK_CONNECT_BASE_URL}?${urlParams}`,
        `${METAMASK_DEEPLINK_BASE}?${urlParams}`,
        '_self',
      );
    } else if (instance.state.remote?.isPaused()) {
      logger(
        `[RCPMS: _write()] MM is PAUSED! deeplink with connect! targetMethod=${targetMethod}`,
      );

      instance.state.platformManager?.openDeeplink(
        `${METAMASK_CONNECT_BASE_URL}?redirect=true&${urlParams}`,
        `${METAMASK_DEEPLINK_BASE}?redirect=true&${urlParams}`,
        '_self',
      );
    } else {
      // Already connected with custom rpc method (don't need redirect) - send message without opening metamask mobile.
      // instance only happens when metamask was opened in last 30seconds.
      logger(`[RCPMS: _write()] method ${targetMethod} doesn't need redirect.`);
    }


  } catch (err) {
    logger(`[RCPMS: _write()] error sending message`, err);

    return callback(
      new Error('RemoteCommunicationPostMessageStream - disconnected'),
    );
  }

  return callback();
}
