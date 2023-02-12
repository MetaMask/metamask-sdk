import { Buffer } from 'buffer';
import { Duplex } from 'stream';
import {
  CommunicationLayerMessage,
  EventType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import { METHODS_TO_REDIRECT } from '../config';
import { ProviderConstants } from '../constants';
import { Platform } from '../Platform/Platfform';
import { Ethereum } from '../services/Ethereum';
import { PlatformType } from '../types/PlatformType';
import { PostMessageStream } from './PostMessageStream';

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

    this.remote.once(EventType.CLIENTS_READY, async () => {
      try {
        const provider = Ethereum.getProvider();
        await provider.forceInitializeState();

        if (debug) {
          console.debug(
            `RCPMS::on 'clients_ready' provider.state`,
            provider.getState(),
          );
        }
      } catch (err) {
        // Ignore error if already initialized.
        // console.debug(`IGNORE ERROR`, err);
      }
    });

    this.remote.on(EventType.CLIENTS_DISCONNECTED, () => {
      if (this.debug) {
        console.debug(`[RCPMS] received '${EventType.CLIENTS_DISCONNECTED}'`);
      }

      const provider = Ethereum.getProvider();
      provider.handleDisconnect();
    });
  }

  /**
   * Called when querying the sdk provider with ethereum.request
   */
  _write(
    chunk: any,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    if (!this.remote.isConnected()) {
      if (this.debug) {
        console.log(`[RCPMS] NOT CONNECTED - EXIT`, chunk);
      }

      return callback();
    }

    if (this.debug) {
      console.debug(
        `RPCMS::_write remote.isPaused()=${this.remote.isPaused()}`,
        chunk,
      );
    }

    try {
      let data;
      if (Buffer.isBuffer(chunk)) {
        data = chunk.toJSON();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data._isBuffer = true;
      } else {
        data = chunk;
      }

      this.remote.sendMessage(data?.data);

      console.log(`RCPMS::_write debug1`);
      const platform = Platform.getInstance();

      const isDesktop = platform.getPlatformType() === PlatformType.DesktopWeb;
      const isNotBrowser = platform.isNotBrowser();
      const isReactNative = platform.isReactNative();

      console.log(`RCPMS::_write debug2`);
      if (!isReactNative && (isDesktop || isNotBrowser)) {
        // Redirect early if nodejs or browser...
        if (this.debug) {
          console.log(
            `RCPMS::_write isDektop=${isDesktop} isNotBrowser=${isNotBrowser}`,
          );
        }
        return callback();
      }
      console.log(`RCPMS::_write debug3`);
      const targetMethod = data?.data
        ?.method as keyof typeof METHODS_TO_REDIRECT;
      // Check if should open app
      let urlParams = ``;
      const channelId = this.remote.getChannelConfig()?.channelId;
      if (channelId) {
        urlParams += `otp=${channelId}`;
      }

      console.log(`RCPMS::_write debug4`, urlParams);
      if (METHODS_TO_REDIRECT[targetMethod] && !isDesktop) {
        if (this.debug) {
          console.debug(
            `RCPMS::_write redirect link for '${targetMethod}'`,
            `connect?${urlParams}`,
          );
        }

        // Use otp to re-enable host approval
        platform.openDeeplink(
          `https://metamask.app.link/connect?${urlParams}`,
          `metamask://connect?${urlParams}`,
          '_self',
        );
      } else if (this.remote.isPaused() && !isDesktop) {
        if (this.debug) {
          console.debug(
            `RCPMS::_write MM is PAUSED! deeplink with connect! targetMethod=${targetMethod}`,
          );
        }

        platform.openDeeplink(
          `https://metamask.app.link/connect?redirect=true`,
          `metamask://connect?redirect=true`,
          '_self',
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
