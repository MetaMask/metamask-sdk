import { Buffer } from 'buffer';
import { Duplex } from 'stream';

import {
  CommunicationLayerMessage,
  EventType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';

import { METHODS_TO_REDIRECT, RPC_METHODS } from '../config';
import { ProviderConstants } from '../constants';
import { Platform } from '../Platform/Platfform';
import { Ethereum } from '../services/Ethereum';
import { PostMessageStream } from './PostMessageStream';

// TODO refactor to have proper types on data
const extractMethod = (chunk: any): { method: string; data: any } => {
  let data: any;
  if (Buffer.isBuffer(chunk)) {
    data = chunk.toJSON();
    data._isBuffer = true;
  } else {
    data = chunk;
  }

  const targetMethod = data?.data?.method as string;
  return { method: targetMethod, data };
};

export class RemoteCommunicationPostMessageStream
  extends Duplex
  implements PostMessageStream
{
  private _name: any;

  private remote: RemoteCommunication;

  private debug;

  constructor({
    name,
    remote,
    debug,
  }: {
    name: ProviderConstants;
    remote: RemoteCommunication;
    debug: boolean;
  }) {
    super({
      objectMode: true,
    });
    this._name = name;
    this.remote = remote;
    this.debug = debug;

    this._onMessage = this._onMessage.bind(this);
    this.remote.on(EventType.MESSAGE, this._onMessage);
  }

  /**
   * Called when querying the sdk provider with ethereum.request
   */
  async _write(
    chunk: any,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    const platform = Platform.getInstance();
    // Special Case if trusted device (RN or mobile web), we still create deeplink to wake up the connection.
    const isRemoteReady = this.remote.isReady();
    const socketConnected = this.remote.isConnected();
    const isPaused = this.remote.isPaused();
    const ready = this.remote.isReady();
    const provider = Ethereum.getProvider();
    const channelId = this.remote.getChannelId();
    const authorized = this.remote.isAuthorized();
    const { method: targetMethod, data } = extractMethod(chunk);

    if (this.debug) {
      console.debug(
        `RPCMS::_write method='${targetMethod}' isRemoteReady=${isRemoteReady} channelId=${channelId} isSocketConnected=${socketConnected} isRemotePaused=${isPaused} providerConnected=${provider.isConnected()}`,
        chunk,
      );
    }

    if (!channelId) {
      // ignore initial metamask_getProviderState() call from ethereum.init()
      if (
        this.debug &&
        targetMethod !== RPC_METHODS.METAMASK_GETPROVIDERSTATE
      ) {
        console.warn(`RPCMS::_write Invalid channel id -- undefined`);
      }

      return callback();
    }

    if (this.debug) {
      console.debug(
        `RPCMS::_write remote.isPaused()=${this.remote.isPaused()} authorized=${authorized} ready=${ready} socketConnected=${socketConnected}`,
        chunk,
      );
    }

    try {
      this.remote.sendMessage(data?.data);
      if (!platform.isSecure()) {
        // Redirect early if nodejs or browser...
        if (this.debug) {
          console.log(
            `RCPMS::_write unsecure platform for method ${targetMethod} -- return callback`,
          );
        }
        return callback();
      }

      if (this.debug) {
        console.log(`RCPMS::_write sending delayed method ${targetMethod}`);
      }

      if (!socketConnected && !ready) {
        // Invalid connection status
        if (this.debug) {
          console.debug(
            `RCPMS::_write invalid connection status targetMethod=${targetMethod} socketConnected=${socketConnected} ready=${ready} providerConnected=${provider.isConnected()}\n\n`,
          );
        }

        return callback();
      }

      if (!socketConnected && ready) {
        // Shouldn't happen -- needs to refresh
        console.warn(`RCPMS::_write invalid socket status -- shouln't happen`);
        return callback();
      }

      // Check if should open app
      const pubKey = this.remote.getKeyInfo()?.ecies.public ?? '';

      const urlParams = encodeURI(
        `channelId=${channelId}&pubkey=${pubKey}&comm=socket`,
      );

      if (METHODS_TO_REDIRECT[targetMethod]) {
        if (this.debug) {
          console.debug(
            `RCPMS::_write redirect link for '${targetMethod}' socketConnected=${socketConnected}`,
            `connect?${urlParams}`,
          );
        }

        // Use otp to re-enable host approval
        platform.openDeeplink(
          `https://metamask.app.link/connect?${urlParams}`,
          `metamask://connect?${urlParams}`,
          '_self',
        );
      } else if (this.remote.isPaused()) {
        if (this.debug) {
          console.debug(
            `RCPMS::_write MM is PAUSED! deeplink with connect! targetMethod=${targetMethod}`,
          );
        }

        platform.openDeeplink(
          `https://metamask.app.link/connect?redirect=true&${urlParams}`,
          `metamask://connect?redirect=true&${urlParams}`,
          '_self',
        );
      } else {
        // Already connected with custom rpc method (don't need redirect) - send message without opening metamask mobile.
        // This only happens when metamask was opened in last 30seconds.
        console.debug(
          `RCPMS::_write method ${targetMethod} doesn't need redirect.`,
        );
      }
    } catch (err) {
      if (this.debug) {
        console.error('RCPMS::_write error', err);
      }
      return callback(
        new Error('RemoteCommunicationPostMessageStream - disconnected'),
      );
    }

    return callback();
  }

  _read() {
    return undefined;
  }

  _onMessage(message: CommunicationLayerMessage) {
    try {
      // validate message
      /* if (this._origin !== '*' && event.origin !== this._origin) {
      return;
    }*/
      if (this.debug) {
        console.debug(`[RCPMS] _onMessage `, message);
      }

      const typeOfMsg = typeof message;

      if (!message || typeOfMsg !== 'object') {
        return;
      }

      // We only want reply from MetaMask.
      const typeOfData = typeof message?.data;
      if (typeOfData !== 'object') {
        return;
      }

      if (!message?.name) {
        return;
      }

      if (message?.name !== ProviderConstants.PROVIDER) {
        return;
      }

      if (Buffer.isBuffer(message)) {
        const data = Buffer.from(message);
        this.push(data);
      } else {
        this.push(message);
      }
    } catch (err) {
      if (this.debug) {
        console.debug(`RCPMS ignore message error`, err);
      }
    }
  }

  start() {
    // Ethereum.ethereum.isConnected = () => RemoteConnection.isConnected();
  }
}
