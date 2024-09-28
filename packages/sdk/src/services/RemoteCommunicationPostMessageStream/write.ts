import { RemoteCommunicationPostMessageStream } from '../../PostMessageStream/RemoteCommunicationPostMessageStream';
import { METHODS_TO_REDIRECT, RPC_METHODS } from '../../config';
import {
  METAMASK_CONNECT_BASE_URL,
  METAMASK_DEEPLINK_BASE,
} from '../../constants';
import { base64Encode } from '../../utils/base64';
import { logger } from '../../utils/logger';
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
  const { deeplinkProtocol } = instance.state;
  const {
    method: targetMethod,
    data,
    triggeredInstaller,
  } = extractMethod(chunk);

  logger(
    `[RCPMS: write()] method='${targetMethod}' isRemoteReady=${isRemoteReady} channelId=${channelId} isSocketConnected=${socketConnected} isRemotePaused=${isPaused} providerConnected=${provider.isConnected()}`,
    chunk,
  );

  if (!channelId) {
    // ignore initial metamask_getProviderState() call from ethereum.init()
    if (targetMethod !== RPC_METHODS.METAMASK_GETPROVIDERSTATE) {
      logger(`[RCPMS: write()] ${targetMethod} --> channelId is undefined`);
    }

    return callback(new Error('disconnected'));
  }

  logger(
    `[RCPMS: write()] remote.isPaused()=${instance.state.remote?.isPaused()} authorized=${authorized} ready=${isRemoteReady} socketConnected=${socketConnected}`,
    chunk,
  );

  // isSecure is only available in RN and mobile web
  const isSecure = instance.state.platformManager?.isSecure();
  const mobileWeb = instance.state.platformManager?.isMobileWeb() ?? false;
  const deeplinkProtocolAvailable =
    instance.state.remote?.hasDeeplinkProtocol() ?? false;
  const activeDeeplinkProtocol =
    deeplinkProtocolAvailable && mobileWeb && authorized;

  try {
    if (!activeDeeplinkProtocol || triggeredInstaller) {
      // The only reason not to send via network is because the rpc call will be sent in the deeplink
      instance.state.remote
        ?.sendMessage(data?.data)
        .then(() => {
          logger(`[RCPMS: _write()] ${targetMethod} sent successfully`);
        })
        .catch((err: unknown) => {
          logger(`[RCPMS: _write()] error sending message`, err);
        });
    }

    if (!isSecure) {
      // Redirect early if nodejs or browser...
      logger(
        `[RCPMS: _write()] unsecure platform for method ${targetMethod} -- return callback`,
      );
      return callback();
    }

    if (triggeredInstaller) {
      logger(
        `[RCPMS: _write()] prevent deeplink -- installation completed separately.`,
      );
      return callback();
    }

    const pubKey = instance.state.remote?.getKeyInfo()?.ecies.public ?? '';
    let urlParams = encodeURI(
      `channelId=${channelId}&pubkey=${pubKey}&comm=socket&t=d&v=2`,
    );

    if (activeDeeplinkProtocol) {
      const jsonrpc = JSON.stringify(data?.data);
      const encrypted = instance.state.remote?.encrypt(jsonrpc);
      if (!encrypted) {
        logger(`[RCPMS: _write()] error encrypting message`);
        return callback(
          new Error('RemoteCommunicationPostMessageStream - disconnected'),
        );
      }
      const encoded = base64Encode(encrypted);
      urlParams += `&scheme=${deeplinkProtocol}&rpc=${encoded}`;
    }

    if (!instance.state.platformManager?.isMetaMaskInstalled()) {
      logger(
        `[RCPMS: _write()] prevent deeplink until installation is completed.`,
      );
      return callback();
    }

    if (METHODS_TO_REDIRECT[targetMethod]) {
      logger(
        `[RCPMS: _write()] redirect link for '${targetMethod}' socketConnected=${socketConnected} connect?${urlParams}`,
      );

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
